/* ─────────────────────────────────────────────────────────────────
   MacroDash — Production Server (Express)

   - Serves static dashboard
   - Proxies FRED API (key kept server-side via FRED_API_KEY env var)
   - 30-min in-memory cache for FRED responses
   - PostgreSQL persistence for ISM PMI data, scoped per-user via
     anonymous UUID stored in browser localStorage. No login required.
   ───────────────────────────────────────────────────────────────── */

const express = require('express');
const path    = require('path');
const https   = require('https');
const { Pool } = require('pg');

const app  = express();
const PORT = process.env.PORT || 5173;
const FRED_API_KEY  = process.env.FRED_API_KEY  || '';
const DATABASE_URL  = process.env.DATABASE_URL  || '';

app.use(express.json({ limit: '512kb' }));

if (!FRED_API_KEY) {
  console.warn('⚠️  FRED_API_KEY env var not set — FRED endpoints will fail.');
}

// ── PostgreSQL connection ─────────────────────────────────────────
let pool = null;
if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    // Railway PG works fine without SSL flag, but enable when explicitly required
    ssl: DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
  });
  pool.on('error', (err) => console.error('Postgres pool error:', err.message));
} else {
  console.warn('⚠️  DATABASE_URL not set — ISM persistence disabled.');
  console.warn('   On Railway: add a Postgres plugin → DATABASE_URL is auto-injected.');
}

// Initialize schema on startup
async function initSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ism_data (
      user_id    TEXT NOT NULL,
      date       TEXT NOT NULL,
      values     JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, date)
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_ism_user ON ism_data(user_id);`);
  console.log('✓ Postgres schema ready');
}

// ── Server-side FRED cache ────────────────────────────────────────
const FRED_CACHE_TTL = 30 * 60 * 1000;
const fredCache = new Map();
let cacheHits = 0, cacheMisses = 0, cacheEvictions = 0;

setInterval(() => {
  const now = Date.now();
  let removed = 0;
  for (const [k, v] of fredCache.entries()) {
    if (now - v.ts > FRED_CACHE_TTL) { fredCache.delete(k); removed++; }
  }
  if (removed) cacheEvictions += removed;
}, 5 * 60 * 1000);

// ── Static frontend ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dashboard'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ── FRED proxy with caching ───────────────────────────────────────
app.get('/api/fred/*', (req, res) => {
  const fredPath = req.params[0];
  const params = new URLSearchParams(req.query);
  params.set('api_key', FRED_API_KEY);
  params.set('file_type', 'json');

  const fredUrl = `https://api.stlouisfed.org/fred/${fredPath}?${params.toString()}`;
  const cacheKey = `${fredPath}?${new URLSearchParams(req.query).toString()}`;

  const cached = fredCache.get(cacheKey);
  if (cached && (Date.now() - cached.ts) < FRED_CACHE_TTL) {
    cacheHits++;
    res.status(cached.status);
    res.set('Content-Type', 'application/json');
    res.set('X-Cache', 'HIT');
    res.set('Access-Control-Allow-Origin', '*');
    return res.send(cached.data);
  }

  cacheMisses++;
  https.get(fredUrl, (apiRes) => {
    let body = '';
    apiRes.on('data', chunk => { body += chunk; });
    apiRes.on('end', () => {
      if (apiRes.statusCode === 200 && body.trim().startsWith('{')) {
        fredCache.set(cacheKey, { ts: Date.now(), data: body, status: apiRes.statusCode });
      }
      res.status(apiRes.statusCode);
      res.set('Content-Type', 'application/json');
      res.set('X-Cache', 'MISS');
      res.set('Access-Control-Allow-Origin', '*');
      res.send(body);
    });
  }).on('error', (err) => {
    res.status(502).json({ error: 'FRED upstream error: ' + err.message });
  });
});

// ── ISM PMI Persistence (PostgreSQL, per-user via x-user-id) ──────
// Each request must include a user_id (header X-User-Id or query param)
// to identify the anonymous user. The frontend generates a UUID on
// first visit and stores it in localStorage.

function requireUser(req, res, next) {
  const userId = (req.get('X-User-Id') || req.query.user_id || '').toString().trim();
  if (!userId || userId.length < 8 || userId.length > 64) {
    return res.status(400).json({ error: 'Missing or invalid user_id (provide via X-User-Id header or user_id query param)' });
  }
  if (!pool) {
    return res.status(503).json({ error: 'Database not configured (DATABASE_URL missing)' });
  }
  req.userId = userId;
  next();
}

// GET /api/ism — return all months stored for this user
app.get('/api/ism', requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT date, values FROM ism_data WHERE user_id = $1 ORDER BY date ASC',
      [req.userId]
    );
    const out = {};
    rows.forEach(r => { out[r.date] = r.values; });
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: 'DB error: ' + e.message });
  }
});

// POST /api/ism — upsert one month for this user
// Body: { date: 'YYYY-MM-01', values: { NAPM: 49.0, ... } }
app.post('/api/ism', requireUser, async (req, res) => {
  const { date, values } = req.body || {};
  if (!date || !/^\d{4}-\d{2}-01$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date — expected YYYY-MM-01' });
  }
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return res.status(400).json({ error: 'Invalid values object' });
  }
  try {
    // Merge with existing values for that date
    const existing = await pool.query(
      'SELECT values FROM ism_data WHERE user_id = $1 AND date = $2',
      [req.userId, date]
    );
    const merged = existing.rows.length
      ? { ...existing.rows[0].values, ...values }
      : values;

    await pool.query(
      `INSERT INTO ism_data (user_id, date, values, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, date)
       DO UPDATE SET values = $3, updated_at = NOW()`,
      [req.userId, date, merged]
    );
    res.json({ ok: true, date, values: merged });
  } catch (e) {
    res.status(500).json({ error: 'DB error: ' + e.message });
  }
});

// DELETE /api/ism/:date — remove one month for this user
app.delete('/api/ism/:date', requireUser, async (req, res) => {
  const { date } = req.params;
  try {
    const r = await pool.query(
      'DELETE FROM ism_data WHERE user_id = $1 AND date = $2',
      [req.userId, date]
    );
    if (!r.rowCount) return res.status(404).json({ error: 'Date not found for this user' });
    res.json({ ok: true, deleted: date });
  } catch (e) {
    res.status(500).json({ error: 'DB error: ' + e.message });
  }
});

// PUT /api/ism — bulk replace all months for this user
// Body: { "2026-04-01": {...}, "2026-03-01": {...}, ... }
app.put('/api/ism', requireUser, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Body must be an object keyed by date' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM ism_data WHERE user_id = $1', [req.userId]);
    for (const [date, values] of Object.entries(req.body)) {
      if (!/^\d{4}-\d{2}-01$/.test(date)) continue;
      if (!values || typeof values !== 'object') continue;
      await client.query(
        `INSERT INTO ism_data (user_id, date, values) VALUES ($1, $2, $3)`,
        [req.userId, date, values]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true, entries: Object.keys(req.body).length });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'DB error: ' + e.message });
  } finally {
    client.release();
  }
});

// ── Health check ──────────────────────────────────────────────────
app.get('/healthz', async (_req, res) => {
  let dbOk = false, totalRows = null;
  if (pool) {
    try {
      const r = await pool.query('SELECT COUNT(*)::int AS c FROM ism_data');
      dbOk = true;
      totalRows = r.rows[0].c;
    } catch (e) {
      dbOk = false;
    }
  }
  res.json({
    status: 'ok',
    fredCache: {
      entries: fredCache.size,
      hits: cacheHits,
      misses: cacheMisses,
      hitRate: cacheHits + cacheMisses > 0
        ? ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1) + '%'
        : 'n/a',
      evictions: cacheEvictions,
      ttlMinutes: FRED_CACHE_TTL / 60000,
    },
    database: {
      connected: dbOk,
      totalIsmRows: totalRows,
    }
  });
});

// ── Catch-all → serve index.html ──────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

// ── Boot ──────────────────────────────────────────────────────────
(async () => {
  try { await initSchema(); }
  catch (e) { console.error('Schema init failed:', e.message); }

  app.listen(PORT, () => {
    console.log(`🚀 MacroDash running on port ${PORT}`);
    console.log(`   → http://localhost:${PORT}`);
    console.log(`   → FRED cache TTL: ${FRED_CACHE_TTL / 60000} min`);
    console.log(`   → Postgres: ${pool ? 'connected' : 'NOT configured'}`);
  });
})();
