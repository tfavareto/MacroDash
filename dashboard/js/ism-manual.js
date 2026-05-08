/* ─────────────────────────────────────────────────────────────────
   MacroDash — ISM Manual Entry
   The official ISM site is reCAPTCHA-protected and blocks scraping.
   This module provides a UI for the user to manually enter the
   monthly ISM PMI values (free, public, ~10 min/month).
   Storage: localStorage key 'ism_data'.
   ───────────────────────────────────────────────────────────────── */

const ISM_FIELDS = [
  // Manufacturing
  { key: 'NAPM',     label: 'PMI Manufacturing',    section: 'Manufacturing' },
  { key: 'NAPMNOI',  label: 'Manuf. New Orders',    section: 'Manufacturing' },
  { key: 'NAPMEI',   label: 'Manuf. Employment',    section: 'Manufacturing' },
  { key: 'NAPMPRI',  label: 'Manuf. Prices Paid',   section: 'Manufacturing' },
  // Services
  { key: 'NMFCI',    label: 'PMI Services',         section: 'Services' },
  { key: 'NMFNOI',   label: 'Services New Orders',  section: 'Services' },
  { key: 'NMFEI',    label: 'Services Employment',  section: 'Services' },
  { key: 'NMFPRI',   label: 'Services Prices Paid', section: 'Services' },
];

function loadISMData() {
  try { return JSON.parse(localStorage.getItem('ism_data') || '{}'); }
  catch { return {}; }
}
function saveISMData(data) {
  localStorage.setItem('ism_data', JSON.stringify(data));
}

/**
 * Returns a series object compatible with the rest of the dashboard.
 * Each ISM field becomes its own pseudo-series.
 */
function getISMSeries(key) {
  const all = loadISMData();
  const obs = Object.entries(all)
    .map(([date, vals]) => ({ date, value: vals[key] }))
    .filter(o => typeof o.value === 'number' && !isNaN(o.value))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!obs.length) return null;
  return {
    raw: obs,
    display: obs,
    latest: obs[obs.length - 1].value,
    latestDate: obs[obs.length - 1].date,
    manual: true,
  };
}

/** Inject all manual ISM series into the loaded USA data object */
function injectISMSeries(usaData) {
  ISM_FIELDS.forEach(f => {
    const series = getISMSeries(f.key);
    if (series) usaData[f.key] = series;
  });
}

// ── UI: render the manual entry panel ──
function renderISMManualPanel(parent) {
  const data = loadISMData();
  const dates = Object.keys(data).sort().reverse();

  const panel = document.createElement('div');
  panel.className = 'ism-panel';
  panel.innerHTML = `
    <div class="ism-panel-header">
      <div>
        <strong>ISM PMI · Entrada Manual</strong>
        <span style="color:var(--muted);margin-left:10px;font-size:.75rem">
          A ISM bloqueia scraping. Copie os valores de
          <a href="https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/" target="_blank" style="color:var(--gold);text-decoration:none">ismworld.org</a>
        </span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn-help-ism" id="btn-help-ism" title="Como usar — passo a passo">?</button>
        <button class="btn-add-ism btn-import-ism" id="btn-import-ism" title="Importar planilha Excel/CSV">📥 Importar Planilha</button>
        <button class="btn-add-ism" id="btn-new-ism">+ Adicionar Mês</button>
      </div>
    </div>
    <div class="ism-help"   id="ism-help"   style="display:none"></div>
    <div class="ism-import" id="ism-import" style="display:none"></div>
    <div class="ism-form"   id="ism-form"   style="display:none"></div>
    <div class="ism-table-wrap"></div>
  `;
  parent.appendChild(panel);

  // Help button toggle
  panel.querySelector('#btn-help-ism').addEventListener('click', () => {
    const help = panel.querySelector('#ism-help');
    if (help.style.display === 'none') {
      renderISMHelp(help);
      help.style.display = 'block';
    } else {
      help.style.display = 'none';
    }
  });

  // Import button toggle
  panel.querySelector('#btn-import-ism').addEventListener('click', () => {
    const box = panel.querySelector('#ism-import');
    if (box.style.display === 'none') {
      renderISMImport(box);
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  });

  // Render existing data table — original sizing, collapsible wrapper
  const tableWrap = panel.querySelector('.ism-table-wrap');
  if (dates.length) {
    // Determine if collapse is needed (more than 4 rows)
    const needsCollapse = dates.length > 4;
    // Remember user's expand preference across re-renders
    const isExpanded = localStorage.getItem('ism_table_expanded') === '1';

    const collapsible = document.createElement('div');
    collapsible.className = 'ism-table-collapsible' + (needsCollapse && !isExpanded ? ' collapsed' : '');
    // Set initial max-height inline (so JS can animate it directly)
    if (needsCollapse && !isExpanded) collapsible.style.maxHeight = '220px';

    const tbl = document.createElement('table');
    tbl.className = 'data-table';
    tbl.innerHTML = `
      <thead><tr>
        <th>Mês</th>
        ${ISM_FIELDS.map(f => `<th class="num">${f.label}</th>`).join('')}
        <th></th>
      </tr></thead>
      <tbody>
        ${dates.map(d => {
          const v = data[d];
          const [y,m] = d.split('-');
          const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
          return `<tr>
            <td class="td-name">${months[+m-1]}/${y.slice(2)}</td>
            ${ISM_FIELDS.map(f => {
              const val = v[f.key];
              if (val === undefined || val === null || val === '') return `<td class="num td-neu">—</td>`;
              const cls = val >= 50 ? 'td-pos' : 'td-neg';
              return `<td class="num ${cls}">${(+val).toFixed(1)}</td>`;
            }).join('')}
            <td><button class="btn-del-ism" data-date="${d}" title="Excluir mês">×</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    `;
    collapsible.appendChild(tbl);
    tableWrap.appendChild(collapsible);

    // Toggle button (only if collapse is needed)
    if (needsCollapse) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'ism-toggle-btn' + (isExpanded ? ' expanded' : '');
      toggleBtn.innerHTML = `<span class="arrow">▲</span><span class="label">${isExpanded ? 'Retrair tabela' : `Expandir tabela (mostrar todos os ${dates.length} meses)`}</span>`;
      toggleBtn.addEventListener('click', () => {
        const willExpand = collapsible.classList.contains('collapsed');
        if (willExpand) {
          collapsible.classList.remove('collapsed');
          collapsible.style.maxHeight = '';                    // remove cap = auto
          toggleBtn.classList.add('expanded');
        } else {
          collapsible.classList.add('collapsed');
          collapsible.style.maxHeight = '220px';
          toggleBtn.classList.remove('expanded');
        }
        toggleBtn.querySelector('.label').textContent = willExpand
          ? 'Retrair tabela'
          : `Expandir tabela (mostrar todos os ${dates.length} meses)`;
        localStorage.setItem('ism_table_expanded', willExpand ? '1' : '0');
      });
      tableWrap.appendChild(toggleBtn);
    }
  } else {
    tableWrap.innerHTML = '<div style="color:var(--muted);padding:12px;font-size:.8rem">Nenhum dado cadastrado. Clique em "+ Adicionar Mês" ou "📥 Importar Planilha" para começar.</div>';
  }

  // New entry button
  panel.querySelector('#btn-new-ism').addEventListener('click', () => {
    const form = panel.querySelector('#ism-form');
    if (form.style.display === 'none') {
      renderISMForm(form);
      form.style.display = 'block';
    } else {
      form.style.display = 'none';
    }
  });

  // Delete buttons
  panel.querySelectorAll('.btn-del-ism').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm(`Excluir dados de ${btn.dataset.date}?`)) return;
      const all = loadISMData();
      delete all[btn.dataset.date];
      saveISMData(all);
      // Re-inject and re-render
      injectISMSeries(state.usaData);
      renderActiveTab();
    });
  });
}

function renderISMHelp(box) {
  box.innerHTML = `
    <div style="padding:18px 20px;background:var(--surface2);border:1px solid var(--border);border-left:3px solid var(--gold);border-radius:4px;margin-top:12px;font-size:.85rem;line-height:1.6">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <strong style="font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--gold)">Como cadastrar dados do ISM PMI · Passo a Passo</strong>
        <button id="btn-close-help" style="background:transparent;border:1px solid var(--border);color:var(--muted);padding:4px 10px;border-radius:3px;cursor:pointer;font-family:inherit">Fechar</button>
      </div>

      <div style="background:rgba(255,122,0,0.08);border-left:2px solid var(--gold);padding:10px 14px;margin-bottom:16px;border-radius:3px;font-size:.78rem;color:var(--text2)">
        <strong style="color:var(--gold)">Por quê manual?</strong> A ISM (Institute for Supply Management) protege seu site com Google reCAPTCHA, bloqueando qualquer raspagem automatizada. Os números headline são públicos e gratuitos no site oficial — basta copiá-los manualmente uma vez por mês.
      </div>

      <ol style="padding-left:22px;color:var(--text2)">
        <li style="margin-bottom:10px">
          <strong style="color:var(--text)">Acesse o site oficial da ISM</strong><br>
          <a href="https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/" target="_blank" style="color:var(--gold);text-decoration:none">ismworld.org/.../ism-pmi-reports/</a>
        </li>

        <li style="margin-bottom:10px">
          <strong style="color:var(--text)">Acesse os dois relatórios mais recentes</strong>
          <ul style="margin-top:6px;padding-left:20px">
            <li><strong>Manufacturing PMI</strong> — link "PMI" / "Manufacturing"</li>
            <li><strong>Services PMI</strong> — link "Services"</li>
          </ul>
          <span style="color:var(--muted);font-size:.78rem">A ISM publica esses dados nos primeiros dias úteis do mês seguinte (Manufacturing por volta do 1º dia útil, Services por volta do 3º).</span>
        </li>

        <li style="margin-bottom:10px">
          <strong style="color:var(--text)">Anote os 8 valores principais</strong>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px;font-size:.8rem">
            <div style="background:var(--surface);padding:10px;border-radius:3px;border:1px solid var(--border)">
              <strong style="color:var(--gold);font-size:.7rem;letter-spacing:0.06em;text-transform:uppercase">Manufacturing</strong>
              <ul style="margin-top:6px;padding-left:18px;line-height:1.7">
                <li>PMI (headline)</li>
                <li>New Orders</li>
                <li>Employment</li>
                <li>Prices Paid</li>
              </ul>
            </div>
            <div style="background:var(--surface);padding:10px;border-radius:3px;border:1px solid var(--border)">
              <strong style="color:var(--gold);font-size:.7rem;letter-spacing:0.06em;text-transform:uppercase">Services</strong>
              <ul style="margin-top:6px;padding-left:18px;line-height:1.7">
                <li>PMI (headline)</li>
                <li>New Orders</li>
                <li>Employment</li>
                <li>Prices Paid</li>
              </ul>
            </div>
          </div>
        </li>

        <li style="margin-bottom:10px">
          <strong style="color:var(--text)">Volte ao MacroDash e clique em <span style="background:var(--gold);color:#000;padding:1px 6px;border-radius:2px;font-size:.78rem">+ Adicionar Mês</span></strong>
        </li>

        <li style="margin-bottom:10px">
          <strong style="color:var(--text)">Selecione a data correta</strong><br>
          Use sempre o <strong>1º dia do mês ao qual os dados se referem</strong> (não a data de publicação).<br>
          <span style="color:var(--muted);font-size:.78rem">Exemplo: dados do "PMI de Abril/2026" → data <code style="background:var(--bg);padding:1px 5px;border-radius:2px;color:var(--gold)">2026-04-01</code>, mesmo que tenham sido publicados em 1º de Maio.</span>
        </li>

        <li style="margin-bottom:10px">
          <strong style="color:var(--text)">Preencha os 8 campos</strong> com os valores que anotou. Cada campo aceita decimais com 1 casa (ex: <code style="background:var(--bg);padding:1px 5px;border-radius:2px;color:var(--gold)">49.0</code>).<br>
          <span style="color:var(--muted);font-size:.78rem">Pode deixar campos em branco se não tiver o dado — só os preenchidos serão salvos.</span>
        </li>

        <li style="margin-bottom:10px">
          <strong style="color:var(--text)">Clique em Salvar</strong> — pronto! Os valores aparecem imediatamente:
          <ul style="margin-top:6px;padding-left:20px;color:var(--muted);font-size:.78rem">
            <li>No <strong style="color:var(--text2)">Heatmap USA</strong> (grupo "Economic Activity")</li>
            <li>Nos <strong style="color:var(--text2)">gráficos da aba PMI/ISM</strong></li>
            <li>Na <strong style="color:var(--text2)">tabela histórica</strong> (visualização "Tabelas")</li>
          </ul>
        </li>
      </ol>

      <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--border);font-size:.78rem;color:var(--muted)">
        <strong style="color:var(--gold)">💡 Dica:</strong> Os dados ficam salvos no <code>localStorage</code> do seu navegador, persistindo entre sessões. Para excluir um mês, clique no botão <strong>×</strong> na linha correspondente da tabela abaixo.
      </div>

      <div style="margin-top:8px;padding:10px 14px;background:rgba(255,122,0,0.05);border-radius:3px;font-size:.78rem;color:var(--text2)">
        <strong style="color:var(--gold)">📊 Threshold de leitura ISM:</strong>
        <ul style="margin-top:4px;padding-left:20px">
          <li><strong style="color:#1a9850">≥ 50</strong>: Setor em <strong>expansão</strong> (verde no heatmap)</li>
          <li><strong style="color:#fcd34d">~ 50</strong>: Setor <strong>estável</strong> (amarelo)</li>
          <li><strong style="color:#d73027">&lt; 50</strong>: Setor em <strong>contração</strong> (vermelho)</li>
        </ul>
      </div>
    </div>
  `;
  box.querySelector('#btn-close-help').addEventListener('click', () => { box.style.display = 'none'; });
}

// ── Bulk import (XLSX / CSV / paste) ──────────────────────────────

// Map of accepted column names → field key
const ISM_COL_ALIASES = {
  // Date
  'date': '__date', 'data': '__date', 'mes': '__date', 'mês': '__date', 'month': '__date', 'period': '__date',
  // Manufacturing
  'pmi manufacturing': 'NAPM', 'manufacturing pmi': 'NAPM', 'manuf pmi': 'NAPM', 'manuf. pmi': 'NAPM', 'pmi manuf': 'NAPM', 'napm': 'NAPM', 'ism manufacturing': 'NAPM',
  'manuf new orders': 'NAPMNOI', 'manuf. new orders': 'NAPMNOI', 'manufacturing new orders': 'NAPMNOI', 'm. new orders': 'NAPMNOI', 'napmnoi': 'NAPMNOI',
  'manuf employment': 'NAPMEI', 'manuf. employment': 'NAPMEI', 'manufacturing employment': 'NAPMEI', 'm. employment': 'NAPMEI', 'napmei': 'NAPMEI',
  'manuf prices paid': 'NAPMPRI', 'manuf. prices paid': 'NAPMPRI', 'manufacturing prices paid': 'NAPMPRI', 'm. prices paid': 'NAPMPRI', 'napmpri': 'NAPMPRI',
  // Services
  'pmi services': 'NMFCI', 'services pmi': 'NMFCI', 'serv pmi': 'NMFCI', 'serv. pmi': 'NMFCI', 'nmfci': 'NMFCI', 'ism services': 'NMFCI',
  'services new orders': 'NMFNOI', 'serv new orders': 'NMFNOI', 'serv. new orders': 'NMFNOI', 's. new orders': 'NMFNOI', 'nmfnoi': 'NMFNOI',
  'services employment': 'NMFEI', 'serv employment': 'NMFEI', 'serv. employment': 'NMFEI', 's. employment': 'NMFEI', 'nmfei': 'NMFEI',
  'services prices paid': 'NMFPRI', 'serv prices paid': 'NMFPRI', 'serv. prices paid': 'NMFPRI', 's. prices paid': 'NMFPRI', 'nmfpri': 'NMFPRI',
};

function normalizeHeader(s) {
  return String(s || '').toLowerCase().trim().replace(/[\(\)\[\]\.,]/g, '').replace(/\s+/g, ' ');
}

function normalizeDate(v) {
  if (!v) return null;
  // Excel date number?
  if (typeof v === 'number' && v > 25000) {
    // Excel epoch = 1899-12-30
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return d.toISOString().slice(0, 10).replace(/-\d{2}$/, '-01');
  }
  const s = String(v).trim();
  // Already YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (m) return `${m[1]}-${m[2].padStart(2,'0')}-01`;
  // DD/MM/YYYY or MM/DD/YYYY (assume DD/MM)
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-01`;
  // MM/YYYY or YYYY/MM
  m = s.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[2]}-${m[1].padStart(2,'0')}-01`;
  m = s.match(/^(\d{4})[\/\-](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2,'0')}-01`;
  // Pt-BR month names: jan/2026, abril/2026, etc.
  const ptMonths = {jan:'01',fev:'02',mar:'03',abr:'04',mai:'05',jun:'06',jul:'07',ago:'08',set:'09',out:'10',nov:'11',dez:'12',
                    janeiro:'01',fevereiro:'02',março:'03',marco:'03',abril:'04',maio:'05',junho:'06',julho:'07',agosto:'08',setembro:'09',outubro:'10',novembro:'11',dezembro:'12',
                    january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12'};
  m = s.toLowerCase().match(/^([a-zçãé]+)[\/\-\s]+(\d{4})$/i);
  if (m && ptMonths[m[1]]) return `${m[2]}-${ptMonths[m[1]]}-01`;
  // Fallback: try Date.parse
  const d = new Date(s);
  if (!isNaN(d)) {
    return d.toISOString().slice(0,7) + '-01';
  }
  return null;
}

/** Convert an array of objects (header → value) to the ISM data structure */
function parseRowsToISM(rows) {
  if (!rows || !rows.length) return { ok: false, err: 'Planilha vazia.' };

  // Build header → field map using first row keys
  const sample = rows[0];
  const headerMap = {};
  Object.keys(sample).forEach(h => {
    const norm = normalizeHeader(h);
    if (ISM_COL_ALIASES[norm]) headerMap[h] = ISM_COL_ALIASES[norm];
  });

  if (!Object.values(headerMap).includes('__date')) {
    return { ok: false, err: 'Não encontrei coluna de data. Use: Date, Data, Mês, ou Period.' };
  }

  const valueFields = Object.values(headerMap).filter(k => k !== '__date');
  if (!valueFields.length) {
    return { ok: false, err: 'Nenhuma coluna de valor reconhecida. Veja o template.' };
  }

  const out = {};
  let parsed = 0, skipped = 0;
  rows.forEach(r => {
    let dateVal = null;
    Object.entries(headerMap).forEach(([h, k]) => { if (k === '__date') dateVal = r[h]; });
    const date = normalizeDate(dateVal);
    if (!date) { skipped++; return; }
    out[date] = out[date] || {};
    Object.entries(headerMap).forEach(([h, k]) => {
      if (k === '__date') return;
      const v = r[h];
      const num = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
      if (!isNaN(num)) out[date][k] = num;
    });
    parsed++;
  });

  return { ok: true, data: out, parsed, skipped, fields: valueFields };
}

function renderISMImport(box) {
  box.innerHTML = `
    <div style="padding:18px 20px;background:var(--surface2);border:1px solid var(--border);border-left:3px solid var(--gold);border-radius:4px;margin-top:12px;font-size:.85rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <strong style="font-family:'Playfair Display',serif;font-size:1.05rem;color:var(--gold)">Importar Planilha · XLSX / CSV / Colar do Excel</strong>
        <button id="btn-close-import" style="background:transparent;border:1px solid var(--border);color:var(--muted);padding:4px 10px;border-radius:3px;cursor:pointer;font-family:inherit">Fechar</button>
      </div>

      <div style="background:rgba(255,122,0,0.06);padding:10px 14px;margin-bottom:16px;border-radius:3px;font-size:.78rem;color:var(--text2);line-height:1.6">
        <strong style="color:var(--gold)">Formato esperado:</strong> 1ª linha com cabeçalhos, 1ª coluna com data. Nomes de coluna aceitos:
        <code style="background:var(--bg);padding:1px 4px;border-radius:2px;color:var(--gold);font-size:.74rem">Date</code>,
        <code style="background:var(--bg);padding:1px 4px;border-radius:2px;color:var(--gold);font-size:.74rem">PMI Manufacturing</code>,
        <code style="background:var(--bg);padding:1px 4px;border-radius:2px;color:var(--gold);font-size:.74rem">Manuf New Orders</code>,
        <code style="background:var(--bg);padding:1px 4px;border-radius:2px;color:var(--gold);font-size:.74rem">Manuf Employment</code>,
        <code style="background:var(--bg);padding:1px 4px;border-radius:2px;color:var(--gold);font-size:.74rem">Manuf Prices Paid</code>,
        <code style="background:var(--bg);padding:1px 4px;border-radius:2px;color:var(--gold);font-size:.74rem">PMI Services</code>,
        <code style="background:var(--bg);padding:1px 4px;border-radius:2px;color:var(--gold);font-size:.74rem">Services New Orders</code>,
        <code style="background:var(--bg);padding:1px 4px;border-radius:2px;color:var(--gold);font-size:.74rem">Services Employment</code>,
        <code style="background:var(--bg);padding:1px 4px;border-radius:2px;color:var(--gold);font-size:.74rem">Services Prices Paid</code>.
        Variações são aceitas (NAPM, ISM Manufacturing, M. Employment, etc.).
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px">
        <button id="btn-dl-tpl" style="background:transparent;border:1px solid var(--gold);color:var(--gold);padding:6px 12px;border-radius:3px;cursor:pointer;font-size:.75rem;font-family:inherit;font-weight:600">↓ Baixar Template XLSX</button>
        <span style="color:var(--muted);font-size:.78rem">ou cole abaixo / faça upload</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
        <div>
          <label style="font-size:.72rem;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:6px">Upload arquivo XLSX/CSV</label>
          <input type="file" id="ism-file-input" accept=".xlsx,.xls,.csv" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--text);font-family:inherit;font-size:.78rem;cursor:pointer">
        </div>
        <div>
          <label style="font-size:.72rem;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:6px">Colar do Excel (Ctrl+V)</label>
          <textarea id="ism-paste" placeholder="Cole aqui as células copiadas do Excel (Ctrl+V)" style="width:100%;height:80px;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:3px;color:var(--text);font-family:'Inter',monospace;font-size:.74rem;resize:vertical;outline:none"></textarea>
        </div>
      </div>

      <div id="ism-preview" style="margin-top:14px"></div>

      <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
        <button id="btn-import-confirm" class="btn-add-ism" disabled style="opacity:.5;cursor:not-allowed">Importar</button>
      </div>
    </div>
  `;

  let parsedData = null;

  const previewBox = box.querySelector('#ism-preview');
  const confirmBtn = box.querySelector('#btn-import-confirm');

  function showPreview(parsed) {
    parsedData = parsed;
    if (!parsed.ok) {
      previewBox.innerHTML = `<div style="padding:10px 14px;background:rgba(220,38,38,0.15);border-left:2px solid #dc2626;color:#fca5a5;border-radius:3px;font-size:.8rem">⚠ ${parsed.err}</div>`;
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = .5;
      confirmBtn.style.cursor = 'not-allowed';
      return;
    }
    const dates = Object.keys(parsed.data).sort();
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    previewBox.innerHTML = `
      <div style="padding:10px 14px;background:rgba(34,197,94,0.10);border-left:2px solid #22c55e;color:#86efac;border-radius:3px;font-size:.8rem;margin-bottom:10px">
        ✓ <strong>${parsed.parsed}</strong> meses parseados, <strong>${parsed.fields.length}</strong> indicadores.
        ${parsed.skipped ? `<span style="color:#fca5a5">${parsed.skipped} linhas ignoradas (sem data válida).</span>` : ''}
      </div>
      <details>
        <summary style="cursor:pointer;color:var(--text2);font-size:.78rem;margin-bottom:6px">Ver preview (${dates.length} datas)</summary>
        <div style="max-height:200px;overflow:auto;border:1px solid var(--border);border-radius:3px;padding:8px;background:var(--bg);font-size:.72rem;color:var(--muted)">
          ${dates.slice(0, 24).map(d => {
            const [y,m] = d.split('-');
            const v = parsed.data[d];
            return `<div style="padding:3px 0;border-bottom:1px solid var(--surface2)">${months[+m-1]}/${y.slice(2)}: ${Object.entries(v).map(([k,v])=>`${k}=${v}`).join(', ')}</div>`;
          }).join('')}
          ${dates.length > 24 ? `<div style="margin-top:6px;color:var(--gold)">... e mais ${dates.length - 24} datas</div>` : ''}
        </div>
      </details>
    `;
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = 1;
    confirmBtn.style.cursor = 'pointer';
  }

  // ── File upload ──
  box.querySelector('#ism-file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array', cellDates: false });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      showPreview(parseRowsToISM(rows));
    } catch (err) {
      showPreview({ ok: false, err: 'Erro ao ler arquivo: ' + err.message });
    }
  });

  // ── Paste ──
  box.querySelector('#ism-paste').addEventListener('input', (e) => {
    const text = e.target.value.trim();
    if (!text) { previewBox.innerHTML = ''; confirmBtn.disabled = true; return; }
    try {
      // TSV from Excel paste
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        showPreview({ ok: false, err: 'Cole pelo menos a linha de cabeçalho + 1 linha de dados.' });
        return;
      }
      const sep = lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(sep).map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const cells = line.split(sep);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = cells[i] !== undefined ? cells[i].trim() : ''; });
        return obj;
      });
      showPreview(parseRowsToISM(rows));
    } catch (err) {
      showPreview({ ok: false, err: 'Erro: ' + err.message });
    }
  });

  // ── Confirm import ──
  confirmBtn.addEventListener('click', () => {
    if (!parsedData || !parsedData.ok) return;
    const existing = loadISMData();
    Object.entries(parsedData.data).forEach(([date, vals]) => {
      existing[date] = { ...(existing[date] || {}), ...vals };
    });
    saveISMData(existing);
    injectISMSeries(state.usaData);
    renderActiveTab();
  });

  // ── Template download ──
  box.querySelector('#btn-dl-tpl').addEventListener('click', () => {
    const headers = ['Date','PMI Manufacturing','Manuf New Orders','Manuf Employment','Manuf Prices Paid','PMI Services','Services New Orders','Services Employment','Services Prices Paid'];
    const today = new Date();
    const sampleRows = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i - 1, 1);
      sampleRows.push([d.toISOString().slice(0,10), '', '', '', '', '', '', '', '']);
    }
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ISM');
    XLSX.writeFile(wb, 'macrodash_ism_template.xlsx');
  });

  box.querySelector('#btn-close-import').addEventListener('click', () => { box.style.display = 'none'; });
}

function renderISMForm(form) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()).padStart(2, '0'); // previous month (ISM publishes ~1 month delayed)
  const defaultDate = `${yyyy}-${mm === '00' ? '12' : mm}-01`;

  const sectionsHTML = ['Manufacturing','Services'].map(section => {
    const fields = ISM_FIELDS.filter(f => f.section === section);
    return `
      <div class="ism-form-section">
        <div class="ism-form-section-label">${section}</div>
        ${fields.map(f => `
          <div class="ism-form-row">
            <label>${f.label}</label>
            <input type="number" step="0.1" min="0" max="100" data-key="${f.key}" placeholder="ex: 49.0">
          </div>
        `).join('')}
      </div>`;
  }).join('');

  form.innerHTML = `
    <div style="padding:14px;background:var(--surface2);border-radius:4px;margin-top:12px">
      <div class="ism-form-row" style="margin-bottom:14px">
        <label>Data (1º do mês)</label>
        <input type="date" id="ism-date" value="${defaultDate}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
        ${sectionsHTML}
      </div>
      <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
        <button class="btn-refresh" id="btn-cancel-ism" style="background:transparent;color:var(--muted);border-color:var(--border)">Cancelar</button>
        <button class="btn-refresh" id="btn-save-ism">Salvar</button>
      </div>
    </div>
  `;

  form.querySelector('#btn-cancel-ism').addEventListener('click', () => { form.style.display='none'; });
  form.querySelector('#btn-save-ism').addEventListener('click', () => {
    const date = form.querySelector('#ism-date').value;
    if (!date) { alert('Informe a data.'); return; }
    const data = loadISMData();
    data[date] = data[date] || {};
    form.querySelectorAll('input[data-key]').forEach(inp => {
      const v = inp.value.trim();
      if (v !== '') data[date][inp.dataset.key] = parseFloat(v);
    });
    saveISMData(data);
    injectISMSeries(state.usaData);
    renderActiveTab();
  });
}
