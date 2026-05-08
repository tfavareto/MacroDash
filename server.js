/* ─────────────────────────────────────────────────────────────────
   MacroDash — Production Server (Express)
   Serves the static dashboard and proxies FRED API calls so the API
   key stays server-side (in env var FRED_API_KEY).
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

// ── Static frontend ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dashboard'), {
  // Disable caching of HTML/JS so updates are picked up immediately
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ── FRED proxy ────────────────────────────────────────────────────
// Frontend calls e.g.:
//   /api/fred/series/observations?series_id=UNRATE&observation_start=2020-01-01
// We forward to FRED with the secret api_key appended.
app.get('/api/fred/*', (req, res) => {
  const fredPath = req.params[0]; // e.g. "series/observations"
  const params = new URLSearchParams(req.query);
  params.set('api_key', FRED_API_KEY);
  params.set('file_type', 'json');

  const fredUrl = `https://api.stlouisfed.org/fred/${fredPath}?${params.toString()}`;

  https.get(fredUrl, (apiRes) => {
    res.status(apiRes.statusCode);
    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');  // safety net
    apiRes.pipe(res);
  }).on('error', (err) => {
    res.status(502).json({ error: 'FRED upstream error: ' + err.message });
  });
});

// ── Health check (Railway uses this) ──────────────────────────────
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// ── Catch-all → serve index.html (SPA-style) ──────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MacroDash running on port ${PORT}`);
  console.log(`   → http://localhost:${PORT}`);
});
