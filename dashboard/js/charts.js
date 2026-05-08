/* ─────────────────────────────────────────────────────────────────
   MacroDash — Chart Renderer (Chart.js)
   ───────────────────────────────────────────────────────────────── */

// Chart.js palette — orange-led, complementary tones for multi-series clarity
const PALETTE = [
  '#ff7a00', '#06b6d4', '#22c55e', '#ec4899', '#a78bfa',
  '#f59e0b', '#3b82f6', '#84cc16', '#e11d48', '#8b5cf6',
];

// Chart instances registry (for destroy on re-render)
const _charts = {};

function destroyChart(id) {
  if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
}

// ── Shared Chart.js defaults ───────────────────────────────────────
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.font.size   = 11;
Chart.defaults.color       = '#8a8a90';

const GRID_COLOR  = 'rgba(38,38,38,0.9)';
const TICK_COLOR  = '#7a7a82';

function baseOptions(dualAxis = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#c4c4c8',
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
          font: { size: 11 },
        }
      },
      tooltip: {
        backgroundColor: '#0d0d0d',
        borderColor: '#ff7a00',
        borderWidth: 1,
        titleColor: '#f4f4f5',
        bodyColor: '#c4c4c8',
        padding: 10,
        callbacks: {
          label: ctx => {
            const v = ctx.parsed.y;
            if (v === null || v === undefined) return '';
            const prefix = ctx.dataset.label ? `${ctx.dataset.label}: ` : '';
            return prefix + (Math.abs(v) >= 1000 ? v.toLocaleString('en', {maximumFractionDigits:1}) : v.toFixed(2));
          }
        }
      },
    },
    scales: {
      x: {
        type: 'time',                    // ← fix: align by date instead of treating as category
        time: {
          unit: undefined,                // auto
          tooltipFormat: 'MMM yyyy',
          displayFormats: {
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yy',
            quarter: 'MMM yy',
            year: 'yyyy',
          }
        },
        grid: { color: GRID_COLOR, drawBorder: false },
        ticks: {
          color: TICK_COLOR,
          maxTicksLimit: 8,
          maxRotation: 0,
          autoSkip: true,
        }
      },
      y: {
        grid: { color: GRID_COLOR, drawBorder: false },
        ticks: { color: TICK_COLOR },
        position: 'left',
      },
      ...(dualAxis ? {
        y2: {
          grid: { display: false },
          ticks: { color: TICK_COLOR },
          position: 'right',
        }
      } : {})
    },
  };
}

/**
 * Build a Chart.js dataset object.
 */
function buildDataset(label, obs, colorIdx, chartType, isY2 = false, stacked = false) {
  const color = PALETTE[colorIdx % PALETTE.length];
  const base = {
    label,
    data: obs.map(o => ({ x: o.date, y: o.value })),
    borderColor: color,
    backgroundColor: chartType === 'bar'
      ? color + 'cc'
      : color + '22',
    borderWidth: chartType === 'bar' ? 0 : 1.8,
    pointRadius: 0,
    pointHoverRadius: 4,
    tension: 0.3,
    fill: chartType === 'area',
    yAxisID: isY2 ? 'y2' : 'y',
    stack: stacked ? 'stack' : undefined,
    type: chartType === 'bar' ? 'bar' : 'line',
  };
  return base;
}

/**
 * Render a chart into a container div.
 */
function renderChart(containerId, chartDef, data, seriesNames = {}) {
  destroyChart(containerId);

  const container = document.getElementById(containerId);
  if (!container) return;

  // Build datasets
  const datasets = [];
  chartDef.series.forEach((key, i) => {
    const keyStr = String(key);
    const d = data[keyStr] || data[key] || {};
    const obs = (d.display || []).filter(o => !isNaN(o.value));
    if (!obs.length) return;

    const label = seriesNames[keyStr] || seriesNames[key] || keyStr;
    const isY2 = chartDef.dualAxis && i > 0;
    const ds = buildDataset(label, obs, i, chartDef.type, isY2, chartDef.stacked);
    datasets.push(ds);
  });

  if (!datasets.length) {
    container.innerHTML = '<div style="color:var(--muted);font-size:.78rem;padding:20px;text-align:center">No data available</div>';
    return;
  }

  // Canvas
  const canvas = document.createElement('canvas');
  container.innerHTML = '';
  container.appendChild(canvas);

  const opts = baseOptions(chartDef.dualAxis);

  // Reference line (e.g. 50 for PMI, 0 for yield curves)
  if (chartDef.refLine !== undefined) {
    opts.plugins.annotation = {
      annotations: {
        refLine: {
          type: 'line',
          yMin: chartDef.refLine,
          yMax: chartDef.refLine,
          borderColor: 'rgba(148,163,184,0.35)',
          borderWidth: 1,
          borderDash: [4, 4],
        }
      }
    };
  }

  // Recession shading for USA (USREC)
  if (window._recessionBands && window._recessionBands.length) {
    opts.plugins.annotation = opts.plugins.annotation || { annotations: {} };
    window._recessionBands.forEach((band, idx) => {
      opts.plugins.annotation.annotations[`rec${idx}`] = {
        type: 'box',
        xMin: band.start,
        xMax: band.end,
        backgroundColor: 'rgba(239,68,68,0.08)',
        borderWidth: 0,
      };
    });
  }

  _charts[containerId] = new Chart(canvas, {
    type: chartDef.type === 'bar' ? 'bar' : 'line',
    data: { datasets },
    options: opts,
  });
}

/**
 * Render a grid of charts for a given tab.
 */
function renderChartsGrid(parent, chartDefs, data, seriesNames = {}) {
  const grid = document.createElement('div');
  grid.className = chartDefs.length === 1 ? 'charts-grid single' : 'charts-grid';

  chartDefs.forEach((def, idx) => {
    const card = document.createElement('div');
    card.className = 'chart-card';

    const header = document.createElement('div');
    header.className = 'chart-card-header';
    header.innerHTML = `
      <div class="chart-card-title">${def.title}</div>
      <button class="chart-help-btn" data-chart-idx="${idx}" title="Sobre este gráfico" aria-label="Explicação do gráfico">?</button>
    `;
    card.appendChild(header);

    const wrap = document.createElement('div');
    wrap.className = 'chart-wrap';
    const chartId = `chart-${parent.id || 'tab'}-${idx}`;
    wrap.id = chartId;
    card.appendChild(wrap);

    grid.appendChild(card);
  });

  parent.appendChild(grid);

  // Render each chart after DOM insertion
  chartDefs.forEach((def, idx) => {
    const chartId = `chart-${parent.id || 'tab'}-${idx}`;
    renderChart(chartId, def, data, seriesNames);
  });

  // Wire help buttons (event delegation on the grid)
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.chart-help-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.chartIdx, 10);
    const def = chartDefs[idx];
    if (def) showChartExplanationModal(def);
  });
}

/**
 * Open a modal explaining a chart (what it shows, up/down meaning, why it matters).
 */
function showChartExplanationModal(chartDef) {
  // Remove any existing modal
  const existing = document.querySelector('.chart-explanation-overlay');
  if (existing) existing.remove();

  const e = chartDef.explanation || {};
  const fallback = 'Explicação ainda não cadastrada para este gráfico.';

  const overlay = document.createElement('div');
  overlay.className = 'chart-explanation-overlay';
  overlay.innerHTML = `
    <div class="chart-explanation-modal" role="dialog" aria-modal="true">
      <div class="chart-explanation-header">
        <div class="chart-explanation-eyebrow">SOBRE ESTE GRÁFICO</div>
        <h3>${chartDef.title}</h3>
        <button class="chart-explanation-close" aria-label="Fechar">×</button>
      </div>

      <div class="chart-explanation-section">
        <div class="chart-explanation-label">📊 O QUE MOSTRA</div>
        <div class="chart-explanation-text">${e.what || fallback}</div>
      </div>

      <div class="chart-explanation-grid">
        <div class="chart-explanation-section chart-explanation-up">
          <div class="chart-explanation-label"><span class="arrow-up">↑</span> QUANDO SOBE</div>
          <div class="chart-explanation-text">${e.up || fallback}</div>
        </div>
        <div class="chart-explanation-section chart-explanation-down">
          <div class="chart-explanation-label"><span class="arrow-down">↓</span> QUANDO CAI</div>
          <div class="chart-explanation-text">${e.down || fallback}</div>
        </div>
      </div>

      <div class="chart-explanation-section chart-explanation-why">
        <div class="chart-explanation-label">⭐ POR QUE ACOMPANHAR</div>
        <div class="chart-explanation-text">${e.why || fallback}</div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on backdrop click, button click, or Escape key
  const close = () => overlay.remove();
  overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });
  overlay.querySelector('.chart-explanation-close').addEventListener('click', close);
  const escHandler = (ev) => { if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
  document.addEventListener('keydown', escHandler);
}

/**
 * Render KPI cards row.
 */
function renderKPIRow(parent, kpis, data, seriesNames = {}) {
  const row = document.createElement('div');
  row.className = 'kpi-row';

  kpis.forEach(kpi => {
    const d = data[kpi.key] || data[String(kpi.key)] || {};
    const val = d.latest;
    const dateStr = d.latestDate;
    const dYoY = data[kpi.key + '_YOY'] || data[String(kpi.key) + '_YOY'] || {};
    const yoy = dYoY.latest;

    const card = document.createElement('div');
    card.className = 'kpi-card';

    const chgClass = yoy > 0 ? 'td-pos' : yoy < 0 ? 'td-neg' : 'td-neu';
    const chgSign  = yoy > 0 ? '+' : '';

    card.innerHTML = `
      <div class="kpi-label">${kpi.label}</div>
      <div class="kpi-value">${val !== null && val !== undefined ? formatHeatmapValue(val, kpi.unit) : '—'}</div>
      ${yoy !== null && yoy !== undefined
        ? `<div class="kpi-change ${chgClass}">${chgSign}${yoy.toFixed(2)}% YoY</div>`
        : ''}
      <div class="kpi-date">${fmtDate(dateStr)}</div>
    `;
    row.appendChild(card);
  });

  parent.appendChild(row);
}
