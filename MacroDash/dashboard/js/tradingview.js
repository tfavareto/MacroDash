/* ─────────────────────────────────────────────────────────────────
   MacroDash — TradingView Widgets for B3 Indices
   Uses TradingView's free embed widgets (no API key needed)
   ───────────────────────────────────────────────────────────────── */

const TV_SYMBOLS = [
  { symbol: 'BMFBOVESPA:IBOV',  title: 'Ibovespa (IBOV)',           interval: 'D' },
  { symbol: 'BMFBOVESPA:SMLL',  title: 'Small Caps (SMLL)',         interval: 'D' },
  { symbol: 'BMFBOVESPA:IBRX',  title: 'IBrX 100',                   interval: 'D' },
  { symbol: 'BMFBOVESPA:IFIX',  title: 'Fundos Imobiliários (IFIX)', interval: 'D' },
  { symbol: 'BMFBOVESPA:IDIV',  title: 'Dividendos (IDIV)',          interval: 'D' },
  { symbol: 'BMFBOVESPA:IBHB',  title: 'High Beta (IBHB)',           interval: 'D' },
];

/**
 * Render TradingView widget into a container.
 */
function renderTVWidget(container, symbolDef) {
  const card = document.createElement('div');
  card.className = 'tv-card';
  card.innerHTML = `
    <div class="tv-card-header">
      <div class="tv-card-title">${symbolDef.title}</div>
      <div class="chart-card-meta">TRADINGVIEW</div>
    </div>
    <div class="tv-frame" id="tv-${symbolDef.symbol.replace(/[:.]/g, '-')}"></div>
  `;
  container.appendChild(card);

  // Use TradingView's lightweight Advanced Chart widget via embed iframe
  const frameId  = `tv-${symbolDef.symbol.replace(/[:.]/g, '-')}`;
  const frameEl  = document.getElementById(frameId);
  const widgetId = `tv_widget_${frameId}`;

  // Inject script
  const script = document.createElement('script');
  script.src   = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
  script.async = true;
  script.type  = 'text/javascript';
  script.innerHTML = JSON.stringify({
    autosize: true,
    symbol: symbolDef.symbol,
    interval: symbolDef.interval || 'D',
    timezone: 'America/Sao_Paulo',
    theme: 'dark',
    style: '1',
    locale: 'br',
    toolbar_bg: '#0d0d0d',
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
    backgroundColor: 'rgba(13, 13, 13, 1)',
    gridColor: 'rgba(38, 38, 38, 0.7)',
    allow_symbol_change: false,
    container_id: widgetId,
  });

  // TradingView's embed widget appends a div and then loads the chart
  frameEl.id = widgetId;
  frameEl.appendChild(script);
}

/**
 * Render all B3 widgets into a grid.
 */
function renderTVGrid(container) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill, minmax(540px, 1fr));gap:18px;';
  container.appendChild(wrap);

  TV_SYMBOLS.forEach(s => renderTVWidget(wrap, s));
}
