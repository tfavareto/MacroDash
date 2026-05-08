/* ─────────────────────────────────────────────────────────────────
   MacroDash — Application
   ───────────────────────────────────────────────────────────────── */

const state = {
  country: 'usa',          // 'usa' | 'brazil'
  view:    'charts',       // 'charts' | 'tables'
  activeTab: 'heatmap',
  range: '3y',
  fredApiKey: getFredApiKey(),
  usaData: null,
  brazilData: null,
  loading: false,
};

// ── DOM refs ───────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const countryBtns = document.querySelectorAll('.country-toggle button');
const viewBtns    = document.querySelectorAll('.view-toggle button');
const rangeBtns   = document.querySelectorAll('.range-select button');
const btnRefresh  = $('btn-refresh');
const lastUpdated = $('last-updated');
const sidebar     = $('sidebar');
const errorBanner = $('error-banner');
const loadingEl   = $('loading-section');
const contentEl   = $('tab-content-area');

// Range labels for meta-bar
const RANGE_LABELS = {
  '1y': '1 ano', '2y': '2 anos', '3y': '3 anos',
  '5y': '5 anos', '10y': '10 anos', 'max': 'Máximo'
};

// ── Init ───────────────────────────────────────────────────────────
(function init() {
  updateMetaBar();
  buildSidebar();
  setCountry('usa');

  // Logo click → return to heatmap tab of currently selected country
  const brand = document.querySelector('.brand');
  if (brand) {
    brand.setAttribute('title', 'Voltar ao Heatmap principal');
    brand.setAttribute('role', 'button');
    brand.setAttribute('tabindex', '0');
    const goHome = () => navigateTo('heatmap');
    brand.addEventListener('click', goHome);
    brand.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHome(); }
    });
  }
})();

// ── Country toggle ─────────────────────────────────────────────────
countryBtns.forEach(btn => btn.addEventListener('click', () => setCountry(btn.dataset.country)));
function setCountry(c) {
  state.country = c;
  countryBtns.forEach(b => b.classList.toggle('active', b.dataset.country === c));
  buildSidebar();
  navigateTo('heatmap');
}

// ── View toggle (Charts | Tables) ──────────────────────────────────
viewBtns.forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
function setView(v) {
  state.view = v;
  viewBtns.forEach(b => b.classList.toggle('active', b.dataset.view === v));
  if (getCurrentData()) renderActiveTab();
}

// ── Range selector ─────────────────────────────────────────────────
rangeBtns.forEach(btn => btn.addEventListener('click', () => {
  state.range = btn.dataset.range;
  rangeBtns.forEach(b => b.classList.toggle('active', b.dataset.range === state.range));
  updateMetaBar();
  // Range change requires reloading data with the longer history
  state.usaData = null;
  state.brazilData = null;
  loadData(true);
}));

// ── Refresh ────────────────────────────────────────────────────────
btnRefresh.addEventListener('click', () => {
  state.usaData = null;
  state.brazilData = null;
  loadData(true);
});

// ── Sidebar ────────────────────────────────────────────────────────
function buildSidebar() {
  sidebar.innerHTML = '';
  const tabs = state.country === 'usa' ? USA_TABS : BRAZIL_TABS;
  const label = document.createElement('div');
  label.className = 'nav-section-label';
  label.textContent = state.country === 'usa' ? 'USA · Macro' : 'Brasil · Macro';
  sidebar.appendChild(label);

  tabs.forEach(tab => {
    const item = document.createElement('div');
    item.className = 'nav-item' + (tab.id === state.activeTab ? ' active' : '');
    item.dataset.tab = tab.id;
    item.innerHTML = `${tabIcon(tab.id)}<span>${tab.label}</span>`;
    item.addEventListener('click', () => navigateTo(tab.id));
    sidebar.appendChild(item);
  });
}

function tabIcon(id) {
  const icons = {
    heatmap:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    housing:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    activity:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    pmi:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    gdp:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    labor:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    jobs:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>`,
    eci:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    cpi:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>`,
    pce:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
    monetary:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    financial: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    trade:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    fiscal:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    markets:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    recession: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
    atividade: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    pib:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    inflacao:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>`,
    trabalho:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    credito:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    agregados: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    externo:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
    b3:        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>`,
    recessao:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>`,
  };
  return icons[id] || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>`;
}

// ── Navigation ─────────────────────────────────────────────────────
function navigateTo(tabId) {
  state.activeTab = tabId;
  buildSidebar();
  const data = getCurrentData();
  if (!data) loadData(false);
  else renderActiveTab();
}

function getCurrentData() {
  return state.country === 'usa' ? state.usaData : state.brazilData;
}

// ── Meta-bar ───────────────────────────────────────────────────────
function updateMetaBar() {
  const today = new Date();
  const monthsPt = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  $('meta-published').textContent = `${monthsPt[today.getMonth()]} ${today.getFullYear()}`;
  $('meta-period').textContent = RANGE_LABELS[state.range];
}

// ── Data loading ───────────────────────────────────────────────────
async function loadData(force = false) {
  if (state.loading) return;
  if (state.country === 'usa' && !state.fredApiKey) {
    showError('FRED API key não configurada. Crie js/secrets.local.js com window.SECRETS.FRED_API_KEY = "...".');
    return;
  }
  state.loading = true;
  btnRefresh.disabled = true;
  btnRefresh.textContent = 'Carregando…';
  hideError();
  showLoading();

  try {
    if (state.country === 'usa') {
      state.usaData = await loadUSASeries(state.fredApiKey, state.range, updateLoadingProgress);
      injectISMSeries(state.usaData);
    } else {
      state.brazilData = await loadBrazilSeries(state.range, updateLoadingProgress);
    }
    const t = new Date();
    lastUpdated.textContent = `Atualizado ${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
    renderActiveTab();
  } catch(e) {
    showError(`Falha ao carregar: ${e.message}`);
    hideLoading();
  } finally {
    state.loading = false;
    btnRefresh.disabled = false;
    btnRefresh.textContent = '↺ Atualizar';
  }
}

function showLoading() { loadingEl.style.display = 'flex'; contentEl.style.display = 'none'; }
function hideLoading() { loadingEl.style.display = 'none';  contentEl.style.display = 'block'; }
function updateLoadingProgress(done, total) {
  const pct = Math.round((done / total) * 100);
  const el = $('loading-progress');
  if (el) el.textContent = `Carregando séries… ${done}/${total} (${pct}%)`;
}
function showError(msg) { errorBanner.textContent = '⚠ ' + msg; errorBanner.classList.add('visible'); }
function hideError() { errorBanner.classList.remove('visible'); }

// ── Render active tab ──────────────────────────────────────────────
function renderActiveTab() {
  hideLoading();
  contentEl.innerHTML = '';
  const data  = getCurrentData();
  const tab   = state.activeTab;
  const isUSA = state.country === 'usa';

  if (!data) { showLoading(); loadData(false); return; }

  if (tab === 'heatmap') return renderHeatmapTab(data, isUSA);
  if (tab === 'b3' && !isUSA) return renderB3Tab();

  if (isUSA) renderUSATab(tab, data);
  else renderBrazilTab(tab, data);
}

// ── Heatmap tab ────────────────────────────────────────────────────
function renderHeatmapTab(data, isUSA) {
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = `<h2>${isUSA ? 'USA' : 'Brasil'} <em>Macro Heatmap</em></h2>
    <span class="subtitle">Signal Grid · ${RANGE_LABELS[state.range]}</span>`;
  contentEl.appendChild(header);

  const legend = document.createElement('div');
  legend.className = 'legend-row';
  const colors = [
    ['hm-vbull',  '+5'], ['hm-bull',  '+4'], ['hm-mbull', '+3'],
    ['hm-lbull',  '+2'], ['hm-llbull','+1'], ['hm-neutral','0'],
    ['hm-llbear','-1'], ['hm-lbear','-2'], ['hm-mbear','-3'],
    ['hm-bear',  '-4'], ['hm-vbear','-5'], ['hm-na','S/dado'],
  ];
  legend.innerHTML = '<span>Legenda</span>';
  colors.forEach(([cls,lbl]) => {
    const d = document.createElement('div');
    d.className = 'legend-item';
    d.innerHTML = `<span class="legend-swatch ${cls}"></span><span>${lbl}</span>`;
    legend.appendChild(d);
  });
  contentEl.appendChild(legend);

  const groups = isUSA ? USA_HEATMAP : BRAZIL_HEATMAP;
  renderHeatmap(contentEl, groups, data);
}

// ── B3 tab (TradingView widgets) ───────────────────────────────────
function renderB3Tab() {
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = `<h2>Índices <em>B3</em></h2>
    <span class="subtitle">TradingView · Tempo real</span>`;
  contentEl.appendChild(header);
  renderTVGrid(contentEl);
}

// ── USA tab renderer ───────────────────────────────────────────────
function renderUSATab(tab, data) {
  const tabSeriesDefs = {};
  Object.entries(USA_SERIES).forEach(([k, cfg]) => { if (cfg.tab === tab) tabSeriesDefs[k] = cfg; });

  const tabInfo = USA_TABS.find(t => t.id === tab);
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = `<h2>${tabInfo ? tabInfo.label : tab}</h2>
    <span class="subtitle">${state.view === 'tables' ? 'Tabelas · Histórico' : 'Gráficos · KPIs'}</span>`;
  contentEl.appendChild(header);

  // PMI/ISM tab: surface the manual entry panel up top
  if (tab === 'pmi') {
    renderISMManualPanel(contentEl);
    const sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:var(--border);margin:24px 0';
    contentEl.appendChild(sep);
  }

  if (state.view === 'tables') {
    return renderHistoryTable(contentEl, tabSeriesDefs, data);
  }

  // Charts mode
  const kpiKeys = Object.entries(tabSeriesDefs)
    .filter(([,c]) => c.lo !== undefined)
    .slice(0, 6)
    .map(([k, c]) => ({ key: k, label: c.name, unit: c.unit }));
  if (kpiKeys.length) renderKPIRow(contentEl, kpiKeys, data);

  const chartDefs = USA_CHARTS[tab] || [];
  if (chartDefs.length) {
    renderChartsGrid(contentEl, chartDefs, data, buildUSASeriesNames());
  }
}

// ── Brazil tab renderer ────────────────────────────────────────────
function renderBrazilTab(tab, data) {
  const tabSeriesDefs = {};
  Object.entries(BACEN_SERIES).forEach(([k, cfg]) => { if (cfg.tab === tab) tabSeriesDefs[k] = cfg; });

  const tabInfo = BRAZIL_TABS.find(t => t.id === tab);
  const header = document.createElement('div');
  header.className = 'section-header';
  header.innerHTML = `<h2>${tabInfo ? tabInfo.label : tab}</h2>
    <span class="subtitle">${state.view === 'tables' ? 'Tabelas · Histórico' : 'Gráficos · KPIs'}</span>`;
  contentEl.appendChild(header);

  if (state.view === 'tables') {
    return renderHistoryTable(contentEl, tabSeriesDefs, data);
  }

  const kpiKeys = Object.entries(tabSeriesDefs)
    .filter(([,c]) => c.lo !== undefined)
    .slice(0, 6)
    .map(([k, c]) => ({ key: k, label: c.name, unit: c.unit }));
  if (kpiKeys.length) renderKPIRow(contentEl, kpiKeys, data);

  const chartDefs = BRAZIL_CHARTS[tab] || [];
  if (chartDefs.length) {
    renderChartsGrid(contentEl, chartDefs, data, buildBrazilSeriesNames());
  }
}

// ── History table — wide, horizontal scroll, all indicators × all months ──
function renderHistoryTable(parent, seriesDefs, data) {
  // Collect all unique dates (last N months from displayed range, max 60)
  const seriesKeys = Object.keys(seriesDefs).filter(k => !seriesDefs[k].derived);
  const dateSet = new Set();
  seriesKeys.forEach(k => {
    const obs = (data[k] && data[k].display) || [];
    obs.forEach(o => dateSet.add(o.date));
    // Include derived YoY/MoM dates too
    ['_YOY', '_MOM'].forEach(suf => {
      const d = data[k + suf];
      if (d && d.display) d.display.forEach(o => dateSet.add(o.date));
    });
  });
  const allDates = Array.from(dateSet).sort().reverse(); // newest first
  const showDates = allDates.slice(0, 36);                 // limit to 36 columns

  const wrap = document.createElement('div');
  wrap.className = 'data-table-wrap';

  const tbl = document.createElement('table');
  tbl.className = 'data-table history-table';

  // Header
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  trh.innerHTML = `<th class="history-name">Indicador</th>`;
  showDates.forEach(d => {
    const [y, m] = d.split('-');
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    trh.innerHTML += `<th class="num">${months[+m-1]}/${y.slice(2)}</th>`;
  });
  thead.appendChild(trh);
  tbl.appendChild(thead);

  // Body — for each series, write level/MoM/YoY rows that exist
  const tbody = document.createElement('tbody');
  Object.entries(seriesDefs).forEach(([key, cfg]) => {
    if (cfg.derived) return;
    [
      { suf: '',     label: cfg.name,                      raw: cfg.unit !== '%' && cfg.unit !== 'pp' && cfg.unit !== 'pts' ? false : true },
      { suf: '_MOM', label: cfg.name + ' MoM (%)' },
      { suf: '_YOY', label: cfg.name + ' YoY (%)' },
    ].forEach(({ suf, label }) => {
      const ds = data[key + suf];
      if (!ds || !ds.display || !ds.display.length) return;

      const dateMap = {};
      ds.display.forEach(o => { dateMap[o.date] = o.value; });

      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="history-name">${label}</td>`;
      showDates.forEach(d => {
        const v = dateMap[d];
        if (v === undefined || v === null || isNaN(v)) {
          tr.innerHTML += `<td class="num td-neu">—</td>`;
        } else {
          const fmt = formatTableValue(v, suf ? '%' : cfg.unit);
          const cls = suf ? (v > 0 ? 'td-pos' : v < 0 ? 'td-neg' : 'td-neu') : '';
          tr.innerHTML += `<td class="num ${cls}">${fmt}</td>`;
        }
      });
      tbody.appendChild(tr);
    });
  });

  tbl.appendChild(tbody);
  wrap.appendChild(tbl);
  parent.appendChild(wrap);
}

function formatTableValue(v, unit) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  const abs = Math.abs(v);
  if (unit === '%' || unit === 'pp') {
    return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
  }
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return abs >= 10 ? v.toFixed(1) : v.toFixed(2);
}

// ── Series name maps ───────────────────────────────────────────────
function buildUSASeriesNames() {
  const m = {};
  Object.entries(USA_SERIES).forEach(([k, c]) => {
    m[k] = c.name;
    m[k + '_YOY'] = c.name + ' YoY';
    m[k + '_MOM'] = c.name + ' MoM';
  });
  return m;
}
function buildBrazilSeriesNames() {
  const m = {};
  Object.entries(BACEN_SERIES).forEach(([k, c]) => {
    m[k]                  = c.name;
    m[String(k) + '_YOY'] = c.name + ' YoY';
    m[String(k) + '_MOM'] = c.name + ' MoM';
  });
  m['NUCLEO_MOM']      = 'Média Núcleos';
  m['NUCLEO_YOY']      = 'Núcleos YoY';
  m['NUCLEO_3M_A']     = 'Núcleo 3M Anualizado';
  m['NUCLEO_6M_A']     = 'Núcleo 6M Anualizado';
  m['10844_3M_A']      = 'IPCA Serviços 3M Anualizado';
  m['10844_6M_A']      = 'IPCA Serviços 6M Anualizado';
  m['10843_3M_A']      = 'IPCA Bens 3M Anualizado';
  m['10843_6M_A']      = 'IPCA Bens 6M Anualizado';
  m['28763_3M']        = 'CAGED 3M Avg';
  m['RESULT_ESTATAIS'] = 'Resultado Consolidado das Estatais';
  m['TC_MENOS_IDP']    = 'Transações Correntes - IDP';
  return m;
}
