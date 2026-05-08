# 📊 MacroDash

> A macroeconomic research terminal for **Brazil** 🇧🇷 and the **United States** 🇺🇸 — a Bloomberg-style dashboard for tracking 300+ economic indicators in real time.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stack](https://img.shields.io/badge/stack-vanilla%20JS-yellow)
![Data](https://img.shields.io/badge/data-FRED%20%2B%20BACEN-orange)

---

## ✨ Features

- **150+ U.S. series** via the [FRED API](https://fred.stlouisfed.org/) — Federal Reserve Bank of St. Louis
- **150+ Brazilian series** via [BACEN SGS](https://www3.bcb.gov.br/sgspub/) — Central Bank of Brazil
- **11-level RdYlGn diverging heatmap** (-5 deep red → 0 yellow → +5 deep green)
- **100+ charts** organized by category (Activity, Inflation, Labor, Credit, Fiscal, External Sector, etc.)
- **Every chart has a "?" button with contextual explanations**: what it shows, what it means when it rises or falls, and why it matters
- **Dual visualization mode**: Charts vs. Tables with monthly history
- **Derived calculations**: YoY, MoM, 3M Annualized, 6M Annualized, composite cores, annual sums
- **Live TradingView widgets** for B3 indices (IBOV, SMLL, IBrX, IFIX, IDIV, IBHB)
- **Manual ISM PMI input** with Excel/CSV upload (since ISM blocks scraping with reCAPTCHA)
- **Black + orange theme** with Playfair Display typography for headers

---

## 📸 Screenshots

> Add screenshots after first deploy

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/tfavareto/MacroDash.git
cd MacroDash/dashboard
```

### 2. Configure your FRED API key
1. Create a free account at [fred.stlouisfed.org](https://fred.stlouisfed.org/) and generate an API key
2. Copy the template:
   ```bash
   cp js/secrets.example.js js/secrets.local.js
   ```
3. Open `js/secrets.local.js` and paste your key:
   ```js
   window.SECRETS = {
     FRED_API_KEY: 'your_key_here',
   };
   ```

### 3. Run a local static server
Any HTTP server works. Some options:

```bash
# Option A — Node.js
npx serve -l 5173

# Option B — Python
python -m http.server 5173

# Option C — VSCode
# Install "Live Server" and click "Go Live" in the bottom bar
```

### 4. Open in your browser
```
http://localhost:5173
```

---

## 🗂️ Project Structure

```
dashboard/
├── index.html              # Main shell
├── css/
│   └── style.css          # Black + orange theme
├── js/
│   ├── config.js          # Series, chart, and heatmap definitions
│   ├── api.js             # FRED + BACEN fetcher with caching
│   ├── charts.js          # Chart.js renderer
│   ├── heatmap.js         # Heatmap renderer (11-level RdYlGn scale)
│   ├── app.js             # Main logic, navigation, KPIs
│   ├── tradingview.js     # TradingView widgets for B3
│   ├── ism-manual.js      # ISM PMI manual entry
│   ├── secrets.example.js # Template (no key)
│   └── secrets.local.js   # Your FRED key (DO NOT COMMIT!)
└── .gitignore
```

---

## 🧠 Architecture

### Data Flow
```
Browser ─┬─→ FRED API (USA, via CORS proxy)
         └─→ BACEN SGS API (Brazil, native CORS)
                   ↓
             api.js (1h cache)
                   ↓
          computeYoY/MoM/3MAnnualized/etc
                   ↓
          state.usaData / state.brazilData
                   ↓
         renderHeatmap, renderChartsGrid, renderTable
                   ↓
              Chart.js + DOM
```

### Frontend
- **Vanilla JS** — no framework, no build step. Edit, refresh the page, done.
- **Chart.js 4** + plugins (annotation, time adapter)
- **Inter** + **Playfair Display** + **Roboto** (Google Fonts)
- **In-memory cache** with 1h TTL on API calls

### Indicators
Configured in `config.js` as objects:
```js
const BACEN_SERIES = {
  13522: {
    name: 'IPCA YoY',
    unit: '%',
    tab: 'inflacao',
    dir: -1,             // -1 = lower is better
    lo: 0, hi: 12        // heatmap thresholds
  },
  ...
};
```

Each chart has a complete definition with **contextual explanation**:
```js
{
  title: 'IPCA YoY · Núcleo YoY (%)',
  type: 'line',
  series: [13522, 'NUCLEO_YOY'],
  explanation: {
    what: 'IPCA = headline official inflation...',
    up:   'IPCA above target...',
    down: 'Convergence toward target...',
    why:  'BCB targets the Core, not headline IPCA...'
  }
}
```

---

## 🔌 Data Sources

### 🇺🇸 USA — FRED (Federal Reserve)
- **Base URL:** `https://api.stlouisfed.org/fred/`
- **Auth:** Free API key (required)
- **Rate limit:** 120 requests/min
- **CORS:** ❌ not supported — we route through `https://corsproxy.io/?` as a proxy
- **Coverage:** Housing, Activity, GDP, Labor, ECI, CPI, PCE+PPI, Monetary Policy, Financial Accounts, Trade, Fiscal, Markets, Recession

### 🇧🇷 Brazil — BACEN SGS
- **Base URL:** `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{id}/dados`
- **Auth:** No key needed
- **CORS:** ✅ supported natively
- **Coverage:** Activity, GDP, Inflation, Labor Market, Fiscal Policy, Credit, Monetary Aggregates, External Sector, Recessions

### 📈 B3 — TradingView Widgets
- Free embeds for IBOV, SMLL, IBrX 100, IFIX, IDIV, IBHB

### ⚠️ ISM PMI (Manufacturing/Services)
- ISM blocks scraping with Google reCAPTCHA. Solution: **manual entry** via UI (form + XLSX upload). Enter the headline numbers each month (~10 minutes).

---

## 🎨 Heatmap — Color Scale

11-level RdYlGn diverging palette:

| Level | Color | Meaning |
|---|---|---|
| **+5** | 🟢 Deep green `#006837` | Strongly positive signal |
| **+4** | 🟢 Green `#1a9850` | Bullish |
| **+3** | 🟢 Mid green `#66bd63` | Moderately positive |
| **+2** | 🟢 Light green `#a6d96a` | Positive |
| **+1** | 🟡 Yellow-green `#d9ef8b` | Slightly positive |
| **0** | 🟡 Yellow `#ffffbf` | Neutral |
| **−1** | 🟠 Light orange `#fee08b` | Slightly negative |
| **−2** | 🟠 Orange `#fdae61` | Negative |
| **−3** | 🔴 Red-orange `#f46d43` | Moderately negative |
| **−4** | 🔴 Red `#d73027` | Bearish |
| **−5** | 🔴 Deep red `#a50026` | Strongly negative signal |

Each indicator has `dir: +1` (higher is better) or `dir: -1` (lower is better), plus `lo`/`hi` thresholds. Click on the heatmap legend icon to see the full key.

---

## 🛡️ Security

- ✅ `js/secrets.local.js` is in `.gitignore` — **your FRED API key never leaves your computer**
- ✅ `secrets.example.js` is a safe template (no real keys) that can be committed
- ⚠️ Never paste your API key into any other file — only `secrets.local.js`

---

## 📦 Tech Stack

- [Chart.js 4](https://www.chartjs.org/) — charts
- [chartjs-adapter-date-fns](https://github.com/chartjs/chartjs-adapter-date-fns) — time scale
- [chartjs-plugin-annotation](https://www.chartjs.org/chartjs-plugin-annotation/) — reference lines
- [SheetJS (xlsx)](https://sheetjs.com/) — Excel import for ISM data
- [TradingView Widgets](https://www.tradingview.com/widget/) — live B3 charts
- [Google Fonts](https://fonts.google.com/) — Inter, Playfair Display, Roboto

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Some ideas:

- Map FRED IDs for indicators that are still missing
- Add series from other countries (Eurozone, China, UK)
- Implement PDF export for the dashboard
- Build a Node.js backend to serve data (eliminating the CORS proxy)
- Add a multi-country comparison mode

---

## 🙏 Acknowledgments

- [FRED](https://fred.stlouisfed.org/) — for offering one of the world's largest macroeconomic databases for free
- [BACEN](https://www.bcb.gov.br/) — for the open and comprehensive SGS API
- [TradingView](https://www.tradingview.com/) — for free, embeddable market widgets

---

## 👤 Author

**Thiago Favareto**

Project creator and maintainer. Built MacroDash as a personal research terminal to consolidate macroeconomic data from Brazil and the U.S. into a single, fast, and information-dense interface — bringing professional-grade economic analytics to anyone with a free FRED API key.

- 🐙 GitHub: [@tfavareto](https://github.com/tfavareto)
- 📧 Email: thiagofavareto9@gmail.com

If MacroDash is useful to you, please ⭐ **star the repository** to help others find it.
