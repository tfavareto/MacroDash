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
const https   = require('https');

const app  = express();
const PORT = process.env.PORT || 5173;
const FRED_API_KEY = process.env.FRED_API_KEY || '';

if (!FRED_API_KEY) {
  console.warn('⚠️  FRED_API_KEY env var not set — FRED endpoints will fail.');
  console.warn('   On Railway: Settings → Variables → Add FRED_API_KEY');
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

// ── Health check (Railway uses this) ──────────────────────────────
app.get('/healthz', (_req, res) => res.json({
  status: 'ok',
  cache: {
    entries: fredCache.size,
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: cacheHits + cacheMisses > 0
      ? ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1) + '%'
      : 'n/a',
    evictions: cacheEvictions,
    ttlMinutes: FRED_CACHE_TTL / 60000,
  }
}));

// ── Catch-all → serve index.html ──────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MacroDash running on port ${PORT}`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → Server-side cache: ${FRED_CACHE_TTL / 60000} min TTL`);
});
