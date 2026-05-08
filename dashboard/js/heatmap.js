/* ─────────────────────────────────────────────────────────────────
   MacroTracker — Heatmap Renderer
   ───────────────────────────────────────────────────────────────── */

/**
 * Classify a value into a heatmap color class — 11-level RdYlGn scale.
 * dir: +1 = higher is better, -1 = lower is better, 0 = neutral
 */
function classifyHeatmap(value, lo, hi, dir, neutral) {
  if (value === null || value === undefined || isNaN(value)) return 'hm-na';

  // ── Neutral-anchored scale (e.g. PMI = 50) ──
  if (neutral !== undefined) {
    const diff = value - neutral;
    const spread = Math.max(Math.abs(hi - neutral), Math.abs(lo - neutral));
    let pct = dir * diff / spread;            // +1 best, -1 worst
    if (pct >  1) pct =  1;
    if (pct < -1) pct = -1;

    if (pct >=  0.83) return 'hm-vbull';      // +5
    if (pct >=  0.60) return 'hm-bull';       // +4
    if (pct >=  0.38) return 'hm-mbull';      // +3
    if (pct >=  0.20) return 'hm-lbull';      // +2
    if (pct >=  0.07) return 'hm-llbull';     // +1
    if (pct >= -0.07) return 'hm-neutral';    //  0
    if (pct >= -0.20) return 'hm-llbear';     // -1
    if (pct >= -0.38) return 'hm-lbear';      // -2
    if (pct >= -0.60) return 'hm-mbear';      // -3
    if (pct >= -0.83) return 'hm-bear';       // -4
    return 'hm-vbear';                        // -5
  }

  if (dir === 0) return 'hm-neutral';

  const range = hi - lo;
  if (range === 0) return 'hm-neutral';
  // Normalise 0–1 where 1 = best
  let norm = dir === +1 ? (value - lo) / range : (hi - value) / range;
  if (norm > 1) norm = 1;
  if (norm < 0) norm = 0;

  // 11 evenly-spaced buckets (each ≈ 0.091 wide)
  if (norm >= 0.909) return 'hm-vbull';   // +5
  if (norm >= 0.818) return 'hm-bull';    // +4
  if (norm >= 0.727) return 'hm-mbull';   // +3
  if (norm >= 0.636) return 'hm-lbull';   // +2
  if (norm >= 0.545) return 'hm-llbull';  // +1
  if (norm >= 0.454) return 'hm-neutral'; //  0
  if (norm >= 0.363) return 'hm-llbear';  // -1
  if (norm >= 0.272) return 'hm-lbear';   // -2
  if (norm >= 0.181) return 'hm-mbear';   // -3
  if (norm >= 0.090) return 'hm-bear';    // -4
  return 'hm-vbear';                       // -5
}

function formatHeatmapValue(value, unit) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  let v = value;
  let suffix = '';

  if      (unit === '$T')  { v = value / 1e12; suffix = 'T'; }
  else if (unit === '$B') {
    // FRED native = billions of $. Auto-scale to T if >= 1000.
    if (Math.abs(value) >= 1000) { v = value / 1000; suffix = 'T'; }
    else                          { v = value;        suffix = 'B'; }
  }
  else if (unit === 'R$B') { v = value / 1e9;  suffix = 'B'; }
  else if (unit === '$M')  {
    // FRED native = millions of $. Auto-scale up.
    if      (Math.abs(value) >= 1e6) { v = value / 1e6; suffix = 'T'; }
    else if (Math.abs(value) >= 1e3) { v = value / 1e3; suffix = 'B'; }
    else                              { v = value;       suffix = 'M'; }
  }
  else if (unit === 'K') {
    // Values may be in actual units (e.g. CAGED diff ~200,000) — auto-scale
    if (Math.abs(value) >= 1000) { v = value / 1000; suffix = 'K'; }
    else { v = value; suffix = 'K'; }
  }
  else if (unit === 'M')   { v = value;         suffix = 'M'; }
  else if (unit)            { suffix = ' ' + unit; }

  const abs = Math.abs(v);
  const fmt = abs >= 10000 ? v.toLocaleString('en', {maximumFractionDigits: 0})
            : abs >= 100   ? v.toFixed(1)
            : abs >= 10    ? v.toFixed(1)
            : v.toFixed(2);

  return fmt + suffix;
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m-1]} ${y}`;
}

/**
 * Render a full heatmap (array of group objects) into `container`.
 * data = { [key]: { latest, latestDate } }
 */
function renderHeatmap(container, groups, data) {
  container.innerHTML = '';

  groups.forEach(group => {
    const section = document.createElement('div');
    section.className = 'heatmap-section';

    const label = document.createElement('div');
    label.className = 'heatmap-group-label';
    label.textContent = group.group;
    section.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    group.indicators.forEach(ind => {
      const d = data[ind.key] || data[String(ind.key)] || {};
      const val = d.latest !== undefined ? d.latest : null;
      const dateStr = d.latestDate || null;
      const colorClass = classifyHeatmap(val, ind.lo, ind.hi, ind.dir, ind.neutral);

      const cell = document.createElement('div');
      cell.className = `hm-cell ${colorClass}`;
      cell.title = `${ind.label}: ${val !== null ? val.toFixed(2) : 'N/A'} ${ind.unit}`;

      cell.innerHTML = `
        <div class="hm-label">${ind.label}</div>
        <div class="hm-value">${formatHeatmapValue(val, ind.unit)}</div>
        <div class="hm-date">${fmtDate(dateStr)}</div>
      `;
      grid.appendChild(cell);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

/**
 * Render a data table for a given tab.
 * seriesDefs: { key: { name, unit, dir, lo, hi } }
 * data: { key: { latest, latestDate, display[] } }
 */
function renderDataTable(container, seriesDefs, data) {
  const wrap = document.createElement('div');
  wrap.className = 'data-table-wrap';

  const tbl = document.createElement('table');
  tbl.className = 'data-table';
  tbl.innerHTML = `
    <thead>
      <tr>
        <th>Indicator</th>
        <th>Latest</th>
        <th>Date</th>
        <th>MoM / QoQ</th>
        <th>YoY</th>
        <th>Signal</th>
      </tr>
    </thead>
    <tbody id="tbl-body"></tbody>
  `;

  const tbody = tbl.querySelector('#tbl-body');

  Object.entries(seriesDefs).forEach(([key, cfg]) => {
    if (cfg.derived) return;
    const d = data[key] || {};
    const dYoY = data[key + '_YOY'] || {};
    const dMoM = data[key + '_MOM'] || {};

    const val      = d.latest;
    const dateStr  = d.latestDate;
    const yoy      = dYoY.latest;
    const mom      = dMoM.latest;

    const colorClass = (cfg.lo !== undefined)
      ? classifyHeatmap(val, cfg.lo, cfg.hi, cfg.dir, cfg.neutral)
      : 'hm-neutral';
    const signal = colorClass.replace('hm-', '');

    const badgeClass = signal.includes('bull') ? 'badge-bull'
                     : signal.includes('bear') ? 'badge-bear'
                     : 'badge-neu';
    const signalLabel = signal.includes('vbull') ? 'Strong ↑'
                      : signal.includes('bull')  ? 'Bullish ↑'
                      : signal.includes('vbear') ? 'Strong ↓'
                      : signal.includes('bear')  ? 'Bearish ↓'
                      : 'Neutral';

    const fmtChg = (v) => {
      if (v === null || v === undefined || isNaN(v)) return '<span class="td-neu">—</span>';
      const cl = v > 0 ? 'td-pos' : v < 0 ? 'td-neg' : 'td-neu';
      return `<span class="${cl}">${v > 0 ? '+' : ''}${v.toFixed(2)}${cfg.unit === '%' ? '' : ''}</span>`;
    };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-name">${cfg.name}</td>
      <td class="td-val">${val !== null && val !== undefined ? formatHeatmapValue(val, cfg.unit) : '—'}</td>
      <td class="td-neu" style="color:var(--muted)">${fmtDate(dateStr)}</td>
      <td>${fmtChg(mom !== undefined ? mom : null)}</td>
      <td>${fmtChg(yoy !== undefined ? yoy : null)}</td>
      <td><span class="badge ${badgeClass}">${signalLabel}</span></td>
    `;
    tbody.appendChild(tr);
  });

  wrap.appendChild(tbl);
  container.appendChild(wrap);
}
