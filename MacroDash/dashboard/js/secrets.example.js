/* ─────────────────────────────────────────────────────────────────
   MacroDash — secrets.local.js (OPTIONAL)
   This file is no longer required. The FRED API key is now handled
   by the backend (server.js) via the FRED_API_KEY environment variable.

   • LOCAL DEV: set FRED_API_KEY in your shell before running:
       Linux/Mac:  export FRED_API_KEY=your_key && npm start
       Windows:    set FRED_API_KEY=your_key && npm start
       PowerShell: $env:FRED_API_KEY="your_key"; npm start

   • RAILWAY:   Settings → Variables → add FRED_API_KEY

   Get a free key at https://fred.stlouisfed.org/
   ───────────────────────────────────────────────────────────────── */
window.SECRETS = window.SECRETS || {};
