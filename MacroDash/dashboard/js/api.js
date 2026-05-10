/* ─────────────────────────────────────────────────────────────────
   MacroDash — API Layer
   Fetches FRED (USA) and BACEN/SGS (Brazil) data with caching.
   ───────────────────────────────────────────────────────────────── */

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms
const _cache = {};

// Resolve FRED API key from secrets file (gitignored) or fallback to localStorage
function getFredApiKey() {
  if (window.SECRETS && window.SECRETS.FRED_API_KEY) {
    return window.SECRETS.FRED_API_KEY;
  }
  return localStorage.getItem('fred_api_key') || '';
}

function cacheKey(id, range) { return `${id}::${range}`; }

function getCached(key) {
  const entry = _cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { delete _cache[key]; return null; }
  return entry.data;
}
function setCache(key, data) { _cache[key] = { ts: Date.now(), data }; }

// ── Date helpers ──────────────────────────────────────────────────
function rangeStart(range) {
  const d = new Date();
  switch (range) {
    case '1y':  d.setFullYear(d.getFullYear() - 1);  break;
    case '2y':  d.setFullYear(d.getFullYear() - 2);  break;
    case '5y':  d.setFullYear(d.getFullYear() - 5);  break;
    case '10y': d.setFullYear(d.getFullYear() - 10); break;
    case 'max': return '1950-01-01';
    default:    d.setFullYear(d.getFullYear() - 3);
  }
  return d.toISOString().slice(0, 10);
}

// ── FRED ──────────────────────────────────────────────────────────
// In production (Railway), we hit our own backend proxy at /api/fred/*
// which keeps the API key server-side. In local dev, we still need a
// running Node server (npm start) — the same proxy works locally.
async function fetchFRED(seriesId, range, apiKey /* unused — kept for back-compat */) {
  const ck = cacheKey('fred_' + seriesId, range);
  const cached = getCached(ck);
  if (cached) return cached;

  const start = rangeStart(range);
  const extraStart = new Date(start);
  extraStart.setFullYear(extraStart.getFullYear() - 2);
  const obs_start = extraStart.toISOString().slice(0, 10);

  // Backend proxy adds api_key + file_type; we just pass series params
  const url = `/api/fred/series/observations`
    + `?series_id=${seriesId}`
    + `&observation_start=${obs_start}`
    + `&sort_order=asc`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${seriesId}: HTTP ${res.status}`);
  const json = await res.json();
  if (json.error_code) throw new Error(`FRED ${seriesId}: ${json.error_message}`);

  const obs = json.observations
    .filter(o => o.value !== '.')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }));

  setCache(ck, obs);
  return obs;
}

// ── BACEN / SGS ───────────────────────────────────────────────────
async function fetchBACEN(seriesId, range) {
  const ck = cacheKey('bacen_' + seriesId, range);
  const cached = getCached(ck);
  if (cached) return cached;

  const start = rangeStart(range);
  const extraStart = new Date(start);
  extraStart.setFullYear(extraStart.getFullYear() - 2);
  const d1 = extraStart.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' }).replace(/\//g, '/');

  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesId}/dados`
    + `?formato=json&dataInicial=${d1}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`BACEN ${seriesId}: HTTP ${res.status}`);
  const json = await res.json();

  // BACEN format: [{data:"dd/MM/yyyy", valor:"1.23"}]
  const obs = json.map(o => {
    const [dd, mm, yyyy] = o.data.split('/');
    return { date: `${yyyy}-${mm}-${dd}`, value: parseFloat(o.valor.replace(',', '.')) };
  }).filter(o => !isNaN(o.value));

  setCache(ck, obs);
  return obs;
}

// ── Compute derived series ─────────────────────────────────────────
function computeYoY(obs) {
  const result = [];
  for (let i = 0; i < obs.length; i++) {
    const cur = obs[i];
    const curDate = new Date(cur.date);
    const targetDate = new Date(curDate);
    targetDate.setFullYear(targetDate.getFullYear() - 1);
    // Find closest prior obs within 45 days
    let best = null, bestDiff = Infinity;
    for (let j = i - 1; j >= 0; j--) {
      const d = Math.abs(new Date(obs[j].date) - targetDate);
      if (d < bestDiff && d < 45 * 86400000) { best = obs[j]; bestDiff = d; }
      if (new Date(obs[j].date) < new Date(targetDate.getTime() - 45 * 86400000)) break;
    }
    if (best) {
      result.push({ date: cur.date, value: ((cur.value - best.value) / Math.abs(best.value)) * 100 });
    }
  }
  return result;
}

function computeMoM(obs) {
  const result = [];
  for (let i = 1; i < obs.length; i++) {
    const prev = obs[i - 1];
    const cur  = obs[i];
    if (Math.abs(prev.value) > 0) {
      result.push({ date: cur.date, value: ((cur.value - prev.value) / Math.abs(prev.value)) * 100 });
    }
  }
  return result;
}

function computeMoMDiff(obs) {
  return obs.slice(1).map((o, i) => ({ date: o.date, value: o.value - obs[i].value }));
}

function computeRolling3M(obs) {
  return obs.slice(2).map((o, i) => ({
    date: o.date,
    value: (obs[i].value + obs[i+1].value + o.value) / 3
  }));
}

// 12-month rolling average (used for "12M Avg" series)
function computeRolling12M(obs) {
  return obs.slice(11).map((o, i) => {
    const slice = obs.slice(i, i + 12);
    return { date: o.date, value: slice.reduce((s,x) => s + x.value, 0) / 12 };
  });
}

// 12-month rolling sum (used for trade balance, fiscal flows)
function computeRolling12MSum(obs) {
  return obs.slice(11).map((o, i) => {
    const slice = obs.slice(i, i + 12);
    return { date: o.date, value: slice.reduce((s,x) => s + x.value, 0) };
  });
}

// 3-month annualized growth rate from MoM-pct series.
// Formula:  ((1+x_t/100)*(1+x_{t-1}/100)*(1+x_{t-2}/100))^4 - 1, returned in %
function compute3MAnnualized(momPctObs) {
  return momPctObs.slice(2).map((o, i) => {
    const a = momPctObs[i].value   / 100 + 1;
    const b = momPctObs[i+1].value / 100 + 1;
    const c = o.value              / 100 + 1;
    const annualized = (Math.pow(a * b * c, 4) - 1) * 100;
    return { date: o.date, value: annualized };
  });
}

// 6-month annualized from MoM-pct
function compute6MAnnualized(momPctObs) {
  return momPctObs.slice(5).map((o, i) => {
    let p = 1;
    for (let j = 0; j < 6; j++) p *= (momPctObs[i+j].value / 100 + 1);
    return { date: o.date, value: (Math.pow(p, 2) - 1) * 100 };
  });
}

// ── Filter to display range ────────────────────────────────────────
function filterRange(obs, range) {
  const start = rangeStart(range);
  return obs.filter(o => o.date >= start);
}

// ── Build all series for a given tab ──────────────────────────────
// Returns { seriesKey: { raw, yoy, mom, display, latest, latestDate } }
async function loadUSASeries(fredApiKey, range, onProgress) {
  const results = {};
  const seriesKeys = Object.keys(USA_SERIES);
  let done = 0;

  await Promise.allSettled(seriesKeys.map(async key => {
    try {
      const raw = await fetchFRED(key, range, fredApiKey);
      results[key] = { raw };
      const cfg = USA_SERIES[key];
      if (cfg.compute === 'yoy' || cfg.compute === 'both') {
        results[key + '_YOY'] = { raw: computeYoY(raw), derived: true };
      }
      if (cfg.compute === 'both' || cfg.compute === 'mom') {
        results[key + '_MOM'] = { raw: computeMoM(raw), derived: true };
      }
      if (cfg.compute === 'mom_diff') {
        results[key + '_MOM'] = { raw: computeMoMDiff(raw), derived: true };
      }
    } catch(e) {
      results[key] = { raw: [], error: e.message };
    }
    done++;
    onProgress && onProgress(done, seriesKeys.length);
  }));

  // Compute 3-month rolling avg for PAYEMS_MOM (Jobs Report uses this widely)
  if (results['PAYEMS_MOM'] && results['PAYEMS_MOM'].raw.length) {
    results['PAYEMS_3M'] = { raw: computeRolling3M(results['PAYEMS_MOM'].raw), derived: true };
  }

  // JOLTS / Unemployment ratio — key labor-tightness gauge
  if (results['JTSJOL'] && results['UNEMPLOY'] && results['JTSJOL'].raw.length && results['UNEMPLOY'].raw.length) {
    const unmap = {};
    results['UNEMPLOY'].raw.forEach(o => { unmap[o.date] = o.value; });
    const ratio = results['JTSJOL'].raw
      .filter(o => unmap[o.date] && unmap[o.date] > 0)
      .map(o => ({ date: o.date, value: o.value / unmap[o.date] }));
    results['JOLTS_UNEMPLOY_RATIO'] = { raw: ratio, derived: true };
  }

  // Initial Claims 4-week moving average
  if (results['ICSA'] && results['ICSA'].raw.length >= 4) {
    const obs = results['ICSA'].raw;
    const avg = obs.slice(3).map((o, i) => ({
      date: o.date,
      value: (obs[i].value + obs[i+1].value + obs[i+2].value + o.value) / 4
    }));
    results['ICSA_4WK'] = { raw: avg, derived: true };
  }

  // Annotate latest/latestDate on each
  Object.keys(results).forEach(k => {
    const obs = results[k].raw;
    if (obs && obs.length) {
      const disp = filterRange(obs, range);
      results[k].display = disp;
      results[k].latest = obs[obs.length - 1].value;
      results[k].latestDate = obs[obs.length - 1].date;
    } else {
      results[k].display = [];
      results[k].latest = null;
      results[k].latestDate = null;
    }
  });

  return results;
}

async function loadBrazilSeries(range, onProgress) {
  const results = {};
  const seriesKeys = Object.keys(BACEN_SERIES).map(Number);
  let done = 0;

  await Promise.allSettled(seriesKeys.map(async key => {
    try {
      const raw = await fetchBACEN(key, range);
      results[key] = { raw };
      const cfg = BACEN_SERIES[key];
      if (cfg.compute === 'yoy' || cfg.compute === 'both') {
        results[String(key) + '_YOY'] = { raw: computeYoY(raw), derived: true };
      }
      if (cfg.compute === 'both' || cfg.compute === 'mom') {
        results[String(key) + '_MOM'] = { raw: computeMoM(raw), derived: true };
      }
    } catch(e) {
      results[key] = { raw: [], error: e.message };
    }
    done++;
    onProgress && onProgress(done, seriesKeys.length);
  }));

  // CAGED monthly diff (series 28763 = total stock of formal workers, diff = net hires)
  if (results[28763] && results[28763].raw.length) {
    const cagedDiff = computeMoMDiff(results[28763].raw);
    results['28763_MOM'] = { raw: cagedDiff, derived: true };
    results['28763_3M']  = { raw: computeRolling3M(cagedDiff), derived: true };
    // Override the raw display with diff for latest KPI
    results[28763]._diffLatest = cagedDiff.length ? cagedDiff[cagedDiff.length - 1].value : null;
    results[28763]._diffDate   = cagedDiff.length ? cagedDiff[cagedDiff.length - 1].date  : null;
  }

  // Resultado Estatais Consolidado = Federal (2150) + Estadual (2151) + Municipal (2152)
  // Spreadsheet column Q = soma das 3 séries por mês.
  // Aggregated to YEARLY (Jan-Dec sum). Each bar = ano fechado.
  const estataisIds = [2150, 2151, 2152];
  const estataisObs = estataisIds.filter(k => results[k] && results[k].raw.length).map(k => results[k].raw);
  if (estataisObs.length === 3) {
    // First, sum the 3 monthly series by date
    const map = {};
    estataisObs.forEach(arr => {
      arr.forEach(({ date, value }) => {
        if (!map[date]) map[date] = { date, sum: 0, n: 0 };
        map[date].sum += value;
        map[date].n   += 1;
      });
    });
    const monthly = Object.values(map)
      .filter(r => r.n === 3)
      .sort((a,b) => a.date.localeCompare(b.date))
      .map(r => ({ date: r.date, value: r.sum }));

    // Now aggregate by year — sum all months of each calendar year.
    // BACEN's series 2150/2151/2152 use the "Necessidade de Financiamento"
    // sign convention (positive = deficit, negative = surplus). We INVERT
    // the sign so that surplus = positive (standard fiscal convention).
    const yearMap = {};
    monthly.forEach(({ date, value }) => {
      const year = date.slice(0, 4);
      if (!yearMap[year]) yearMap[year] = { value: 0, monthsCounted: 0 };
      yearMap[year].value += value;
      yearMap[year].monthsCounted += 1;
    });
    const yearly = Object.entries(yearMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, { value }]) => ({ date: `${year}-01-01`, value: -value }));

    results['RESULT_ESTATAIS'] = { raw: yearly, derived: true };
  }

  // Transações Correntes - IDP = 22701 - 22885 (column E na planilha)
  // Mostra a "diferença a financiar" via capital de curto prazo
  if (results[22701] && results[22885] && results[22701].raw.length && results[22885].raw.length) {
    const idpMap = {};
    results[22885].raw.forEach(o => { idpMap[o.date] = o.value; });
    const tcMinusIdp = results[22701].raw
      .filter(o => idpMap[o.date] !== undefined)
      .map(o => ({ date: o.date, value: o.value - idpMap[o.date] }));
    results['TC_MENOS_IDP'] = { raw: tcMinusIdp, derived: true };
  }

  // Compute avg of IPCA cores (each core series = MoM %)
  const coreKeys = [4466, 11427, 16122, 27839, 28750];
  const coreObs = coreKeys.filter(k => results[k] && results[k].raw.length).map(k => results[k].raw);
  if (coreObs.length >= 2) {
    const merged = mergeByDate(coreObs);
    const nucleoMom = merged.map(r => ({ date: r.date, value: r.avg }));
    results['NUCLEO_MOM'] = { raw: nucleoMom, derived: true };
    // YoY = annualized using 12-month compound growth from MoM cores
    const nucleoYoY = nucleoMom.slice(11).map((o, i) => {
      let p = 1;
      for (let j = 0; j < 12; j++) p *= (nucleoMom[i+j].value / 100 + 1);
      return { date: o.date, value: (p - 1) * 100 };
    });
    results['NUCLEO_YOY']  = { raw: nucleoYoY, derived: true };
    results['NUCLEO_3M_A'] = { raw: compute3MAnnualized(nucleoMom), derived: true };
    results['NUCLEO_6M_A'] = { raw: compute6MAnnualized(nucleoMom), derived: true };
  }

  // 3M / 6M annualized for Serviços (10844) — the most-watched core component
  if (results[10844] && results[10844].raw.length) {
    results['10844_3M_A'] = { raw: compute3MAnnualized(results[10844].raw), derived: true };
    results['10844_6M_A'] = { raw: compute6MAnnualized(results[10844].raw), derived: true };
  }
  // 3M / 6M annualized for IPCA Bens (10843)
  if (results[10843] && results[10843].raw.length) {
    results['10843_3M_A'] = { raw: compute3MAnnualized(results[10843].raw), derived: true };
    results['10843_6M_A'] = { raw: compute6MAnnualized(results[10843].raw), derived: true };
  }
  // 3M / 6M annualized for IPCA headline (433)
  if (results[433] && results[433].raw.length) {
    results['433_3M_A'] = { raw: compute3MAnnualized(results[433].raw), derived: true };
    results['433_6M_A'] = { raw: compute6MAnnualized(results[433].raw), derived: true };
  }
  // 12-month compound YoY for series that come as MoM-percent (IGP-M, IPCA Bens, IPCA Serviços, IPCA grupos)
  function compoundYoY(momPctObs) {
    return momPctObs.slice(11).map((o, i) => {
      let p = 1;
      for (let j = 0; j < 12; j++) p *= (momPctObs[i+j].value / 100 + 1);
      return { date: o.date, value: (p - 1) * 100 };
    });
  }
  [189, 10843, 10844, 1635, 1636, 1637, 1638, 1639, 1640, 1641, 1642, 1643, 4467].forEach(id => {
    if (results[id] && results[id].raw.length >= 12) {
      results[String(id) + '_YOY'] = { raw: compoundYoY(results[id].raw), derived: true };
    }
  });

  Object.keys(results).forEach(k => {
    const obs = results[k] ? results[k].raw : [];
    if (obs && obs.length) {
      const disp = filterRange(obs, range);
      results[k].display = disp;
      results[k].latest = obs[obs.length - 1].value;
      results[k].latestDate = obs[obs.length - 1].date;
    } else {
      results[k] = results[k] || {};
      results[k].display = [];
      results[k].latest = null;
      results[k].latestDate = null;
    }
  });

  return results;
}

function mergeByDate(arrays) {
  const map = {};
  arrays.forEach(arr => {
    arr.forEach(({ date, value }) => {
      if (!map[date]) map[date] = { date, vals: [] };
      map[date].vals.push(value);
    });
  });
  return Object.values(map)
    .sort((a,b) => a.date.localeCompare(b.date))
    .map(r => ({ date: r.date, avg: r.vals.reduce((s,v) => s+v, 0) / r.vals.length }));
}
