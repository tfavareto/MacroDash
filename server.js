/* ─────────────────────────────────────────────────────────────────
   MacroDash — Production Server (Express)
   Serves the static dashboard and proxies FRED API calls so the API
   key stays server-side (in env var FRED_API_KEY).

   Includes a server-side in-memory cache (30-min TTL) so multiple
   visitors share the same upstream FRED responses, drastically
   reducing FRED rate-limit pressure.
   ───────────────────────────────────────────────────────────────── */

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const https   = require('https');

const app  = express();
const PORT = process.env.PORT || 5173;
const FRED_API_KEY = process.env.FRED_API_KEY || '';
const ADMIN_TOKEN  = process.env.ADMIN_TOKEN  || '';

// JSON parser for admin POST
app.use(express.json({ limit: '512kb' }));

if (!FRED_API_KEY) {
  console.warn('⚠️  FRED_API_KEY env var not set — FRED endpoints will fail.');
  console.warn('   On Railway: Settings → Variables → Add FRED_API_KEY');
}
if (!ADMIN_TOKEN) {
  console.warn('⚠️  ADMIN_TOKEN env var not set — ISM admin write will be disabled.');
  console.warn('   On Railway: Settings → Variables → Add ADMIN_TOKEN (any random string)');
}

// ── Server-side FRED cache ────────────────────────────────────────
// Keyed by the upstream FRED URL (without api_key for privacy).
// Each entry: { ts: when fetched, data: raw JSON string, status: HTTP code }
const FRED_CACHE_TTL = 30 * 60 * 1000;       // 30 minutes
const fredCache = new Map();
let cacheHits = 0, cacheMisses = 0, cacheEvictions = 0;

// Periodic cleanup so cache doesn't grow forever
setInterval(() => {
  const now = Date.now();
  let removed = 0;
  for (const [k, v] of fredCache.entries()) {
    if (now - v.ts > FRED_CACHE_TTL) { fredCache.delete(k); removed++; }
  }
  if (removed) cacheEvictions += removed;
}, 5 * 60 * 1000);  // every 5 minutes

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
  // Cache key removes api_key for safety/privacy
  const cacheKey = `${fredPath}?${new URLSearchParams(req.query).toString()}`;

  // Cache hit — return immediately
  const cached = fredCache.get(cacheKey);
  if (cached && (Date.now() - cached.ts) < FRED_CACHE_TTL) {
    cacheHits++;
    res.status(cached.status);
    res.set('Content-Type', 'application/json');
    res.set('X-Cache', 'HIT');
    res.set('Access-Control-Allow-Origin', '*');
    return res.send(cached.data);
  }

  // Cache miss — fetch from FRED
  cacheMisses++;
  https.get(fredUrl, (apiRes) => {
    let body = '';
    apiRes.on('data', chunk => { body += chunk; });
    apiRes.on('end', () => {
      // Only cache successful 200 responses with JSON content
      if (apiRes.statusCode === 200 && body.trim().startsWith('{')) {
        fredCache.set(cacheKey, {
          ts: Date.now(),
          data: body,
          status: apiRes.statusCode,
        });
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

// ── ISM PMI persistence ───────────────────────────────────────────
// Stored as a simple JSON file in dashboard/data/ism.json (committed
// to git for free persistence across Railway deploys).
const ISM_FILE = path.join(__dirname, 'dashboard', 'data', 'ism.json');

function readISM() {
  try {
    if (!fs.existsSync(ISM_FILE)) return {};
    return JSON.parse(fs.readFileSync(ISM_FILE, 'utf8') || '{}');
  } catch (e) {
    console.error('Error reading ism.json:', e.message);
    return {};
  }
}
function writeISM(data) {
  // Ensure dir exists (on first run after git clone)
  fs.mkdirSync(path.dirname(ISM_FILE), { recursive: true });
  fs.writeFileSync(ISM_FILE, JSON.stringify(data, null, 2));
}

// Public read — anyone visiting the site sees the same ISM data
app.get('/api/ism', (_req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.json(readISM());
});

// Admin write — requires Bearer token matching ADMIN_TOKEN
function requireAdmin(req, res, next) {
  const auth = req.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized — invalid or missing admin token' });
  }
  next();
}

// Add or update one month's worth of ISM data
// Body: { date: 'YYYY-MM-DD', values: { NAPM: 49.0, NAPMNOI: 48.0, ... } }
app.post('/api/ism', requireAdmin, (req, res) => {
  const { date, values } = req.body || {};
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-01$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date — expected format YYYY-MM-01' });
  }
  if (!values || typeof values !== 'object') {
    return res.status(400).json({ error: 'Missing values object' });
  }
  const data = readISM();
  data[date] = { ...(data[date] || {}), ...values };
  writeISM(data);
  res.json({ ok: true, date, data: data[date] });
});

// Delete a month
app.delete('/api/ism/:date', requireAdmin, (req, res) => {
  const date = req.params.date;
  const data = readISM();
  if (!data[date]) return res.status(404).json({ error: 'Date not found' });
  delete data[date];
  writeISM(data);
  res.json({ ok: true, deleted: date });
});

// Bulk replace — admin can paste a full JSON via single POST
app.put('/api/ism', requireAdmin, (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Body must be a JSON object' });
  }
  writeISM(req.body);
  res.json({ ok: true, entries: Object.keys(req.body).length });
});

// ── Health check (Railway uses this) ──────────────────────────────
app.get('/healthz', (_req, res) => {
  const ism = readISM();
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
    ism: {
      monthsStored: Object.keys(ism).length,
      latestMonth: Object.keys(ism).sort().reverse()[0] || null,
      adminTokenConfigured: !!ADMIN_TOKEN,
    }
  });
});

// ── Catch-all → serve index.html ──────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MacroDash running on port ${PORT}`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → Server-side cache: ${FRED_CACHE_TTL / 60000} min TTL`);
});
