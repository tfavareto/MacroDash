// ─────────────────────────────────────────────────────────────────
// MacroTracker — Config
// ─────────────────────────────────────────────────────────────────

// ── USA: FRED series definitions ──────────────────────────────────
const USA_TABS = [
  { id: 'heatmap',    label: 'Heatmap' },
  { id: 'housing',    label: 'Housing Market' },
  { id: 'activity',   label: 'Economic Activity' },
  { id: 'pmi',        label: 'PMI / ISM' },
  { id: 'gdp',        label: 'GDP' },
  { id: 'labor',      label: 'Labor Market' },
  { id: 'jobs',       label: 'Jobs Report' },
  { id: 'eci',        label: 'ECI' },
  { id: 'cpi',        label: 'CPI' },
  { id: 'pce',        label: 'PCE + PPI' },
  { id: 'monetary',   label: 'Monetary Policy' },
  { id: 'financial',  label: 'Financial Accounts' },
  { id: 'trade',      label: 'Trade Balance' },
  { id: 'fiscal',     label: 'Fiscal Policy' },
  { id: 'markets',    label: 'Market Indexes' },
  { id: 'recession',  label: 'Recession' },
];

const BRAZIL_TABS = [
  { id: 'heatmap',    label: 'Heatmap' },
  { id: 'atividade',  label: 'Atividade' },
  { id: 'pib',        label: 'PIB' },
  { id: 'inflacao',   label: 'Inflação' },
  { id: 'trabalho',   label: 'Merc. Trabalho' },
  { id: 'fiscal',     label: 'Política Fiscal' },
  { id: 'credito',    label: 'Crédito' },
  { id: 'agregados',  label: 'Agregados' },
  { id: 'externo',    label: 'Setor Externo' },
  { id: 'b3',         label: 'Índices B3' },
  { id: 'recessao',   label: 'Recessões' },
];

// ── Color logic ────────────────────────────────────────────────────
// direction: +1 = higher is better, -1 = lower is better
// colorType: 'threshold' uses neutralLow/neutralHigh; 'pmi' uses 50; 'spread' uses 0
const USA_SERIES = {
  // Housing Market
  MORTGAGE30US:      { name: '30y Mortgage Rate', unit: '%',   freq: 'W', tab: 'housing',  dir: -1, lo: 5,   hi: 8  },
  // NAHB Housing Market Index — proprietary, not on FRED's free tier (skipped)
  PERMIT:            { name: 'Building Permits',   unit: 'K',   freq: 'M', tab: 'housing',  dir: +1, lo:1200, hi:1700, compute: 'yoy' },
  HOUST:             { name: 'Housing Starts',     unit: 'K',   freq: 'M', tab: 'housing',  dir: +1, lo:1000, hi:1600, compute: 'yoy' },
  UNDCONTSA:         { name: 'Under Construction', unit: 'K',   freq: 'M', tab: 'housing',  dir: +1, lo: 900, hi:1600, compute: 'yoy' },
  TTLCONS:           { name: 'Constr. Spending',   unit: '$B',  freq: 'M', tab: 'housing',  dir: +1, lo:1500, hi:2200, compute: 'yoy' },
  EXHOSLUSM495S:     { name: 'Existing Home Sales',unit: 'K',   freq: 'M', tab: 'housing',  dir: +1, lo:3800, hi:6000, compute: 'yoy' },
  HSN1F:             { name: 'New Home Sales',     unit: 'K',   freq: 'M', tab: 'housing',  dir: +1, lo: 400, hi: 800, compute: 'yoy' },
  MSACSR:            { name: 'Monthly Supply',     unit: 'mo',  freq: 'M', tab: 'housing',  dir: -1, lo: 4,   hi: 8  },
  CSUSHPISA:         { name: 'Case-Shiller',       unit: 'idx', freq: 'M', tab: 'housing',  dir: +1, lo: 150, hi: 350, compute: 'yoy' },
  FIXHAI:            { name: 'Affordability Index', unit: 'idx', freq: 'M', tab: 'housing', dir: +1, lo: 90,  hi: 180 },

  // Economic Activity
  PCEC96:            { name: 'Real PCE',           unit: '$B',  freq: 'M', tab: 'activity', dir: +1, compute: 'yoy' },
  PCES:              { name: 'PCE Services',       unit: '$B',  freq: 'M', tab: 'activity', dir: +1, compute: 'yoy' },
  PCEDG:             { name: 'PCE Durable Goods',  unit: '$B',  freq: 'M', tab: 'activity', dir: +1, compute: 'yoy' },
  RSAFS:             { name: 'Retail Sales',       unit: '$M',  freq: 'M', tab: 'activity', dir: +1, compute: 'yoy' },
  RSXFS:             { name: 'Core Retail Sales',  unit: '$M',  freq: 'M', tab: 'activity', dir: +1, compute: 'yoy' },
  INDPRO:            { name: 'Industrial Prod.',   unit: 'idx', freq: 'M', tab: 'activity', dir: +1, compute: 'yoy' },
  // Regional Fed Manufacturing surveys (substitutes for ISM removed from FRED)
  GACDISA066MSFRBNY: { name: 'NY Empire State Mfg', unit:'',    freq: 'M', tab: 'activity', dir: +1, lo: -25, hi: 25, neutral: 0 },
  GACDFSA066MSFRBPHI:{ name: 'Philly Fed Mfg',      unit:'',    freq: 'M', tab: 'activity', dir: +1, lo: -25, hi: 25, neutral: 0 },

  // PMI / ISM (manual entry — populated via ISM tab UI; ISM blocked scraping w/ reCAPTCHA)
  NAPM:    { name: 'PMI Manufacturing',         unit: '', freq:'M', tab:'pmi', dir:+1, lo: 44, hi: 60, neutral: 50 },
  NAPMNOI: { name: 'Manuf. New Orders',         unit: '', freq:'M', tab:'pmi', dir:+1, lo: 44, hi: 65, neutral: 50 },
  NAPMEI:  { name: 'Manuf. Employment',         unit: '', freq:'M', tab:'pmi', dir:+1, lo: 44, hi: 60, neutral: 50 },
  NAPMPRI: { name: 'Manuf. Prices Paid',        unit: '', freq:'M', tab:'pmi', dir:-1, lo: 40, hi: 80, neutral: 50 },
  NMFCI:   { name: 'PMI Services',              unit: '', freq:'M', tab:'pmi', dir:+1, lo: 44, hi: 62, neutral: 50 },
  NMFNOI:  { name: 'Services New Orders',       unit: '', freq:'M', tab:'pmi', dir:+1, lo: 44, hi: 68, neutral: 50 },
  NMFEI:   { name: 'Services Employment',       unit: '', freq:'M', tab:'pmi', dir:+1, lo: 44, hi: 62, neutral: 50 },
  NMFPRI:  { name: 'Services Prices Paid',      unit: '', freq:'M', tab:'pmi', dir:-1, lo: 45, hi: 85, neutral: 50 },

  // GDP
  GDPC1:             { name: 'Real GDP',           unit: '$B',  freq: 'Q', tab: 'gdp',      dir: +1, compute: 'yoy' },
  A191RL1Q225SBEA:   { name: 'Real GDP Growth',   unit: '%',   freq: 'Q', tab: 'gdp',      dir: +1, lo: -3,  hi: 5  },
  GPDIC1:            { name: 'Private Inv.',       unit: '$B',  freq: 'Q', tab: 'gdp',      dir: +1, compute: 'yoy' },
  GCEC1:             { name: 'Govt. Expenditures', unit: '$B',  freq: 'Q', tab: 'gdp',      dir: +1, compute: 'yoy' },

  // Labor Market
  CIVPART:           { name: 'LFPR',                unit: '%',   freq: 'M', tab: 'labor',    dir: +1, lo: 61,  hi: 67 },
  LNS11300060:       { name: 'Prime Age LFPR (25-54)',unit:'%',  freq: 'M', tab: 'labor',    dir: +1, lo: 81,  hi: 84 },
  UNRATE:            { name: 'Unemployment Rate',  unit: '%',   freq: 'M', tab: 'labor',    dir: -1, lo: 3,   hi: 8  },
  UNEMPLOY:          { name: 'Unemployment Level', unit: 'K',   freq: 'M', tab: 'labor',    dir: -1, lo: 4500, hi: 12000 },
  SAHMREALTIME:      { name: 'Sahm Rule',          unit: 'pp',  freq: 'M', tab: 'labor',    dir: -1, lo: -0.1,hi: 0.8 },
  PAYEMS:            { name: 'Payrolls',           unit: 'K',   freq: 'M', tab: 'labor',    dir: +1, compute: 'mom_diff', lo: -100, hi: 500 },
  AHETPI:            { name: 'Hourly Earnings',    unit: '$',   freq: 'M', tab: 'labor',    dir: +1, compute: 'yoy' },
  UEMPMEAN:          { name: 'Avg Weeks Unemployed',unit:'wk',  freq: 'M', tab: 'labor',    dir: -1, lo: 15,  hi: 30 },
  JTSJOL:            { name: 'JOLTS Job Openings', unit: 'K',   freq: 'M', tab: 'labor',    dir: +1, lo: 5500, hi: 12000 },
  JTSJOR:            { name: 'Job Openings Rate',  unit: '%',   freq: 'M', tab: 'labor',    dir: +1, lo: 3,   hi: 7  },
  ICSA:              { name: 'Initial Claims',     unit: 'K',   freq: 'W', tab: 'labor',    dir: -1, lo: 180, hi: 400 },
  CCSA:              { name: 'Continuous Claims',  unit: 'K',   freq: 'W', tab: 'labor',    dir: -1, lo:1300, hi:2500 },
  FRBATLWGT3MMAUMHWGO:{ name:'Wage Growth Tracker',unit:'%',    freq: 'M', tab: 'labor',    dir: +1, lo: 2,   hi: 7 },
  DSPIC96:           { name: 'Real Disp. Income',  unit: '$B',  freq: 'M', tab: 'labor',    dir: +1, compute: 'yoy' },
  W875RX1:           { name: 'RDI Ex-Gov Transfers',unit: '$B', freq: 'M', tab: 'labor',    dir: +1, compute: 'yoy' },

  // Jobs Report
  PAYEMS:            { name: 'Total Payrolls',      unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff', lo: -100, hi: 400 },
  USCONS:            { name: 'Construction Jobs',   unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff' },
  MANEMP:            { name: 'Manufacturing Jobs',  unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff' },
  USGOVT:            { name: 'Government Jobs',     unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff' },
  USTRADE:           { name: 'Trade/Trans Jobs',    unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff' },
  USPBS:             { name: 'Prof. & Bus. Svcs',   unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff' },
  USEHS:             { name: 'Educ. & Health',      unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff' },
  USFIRE:            { name: 'Finance/Insurance',   unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff' },
  USINFO:            { name: 'Information',         unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff' },
  USLAH:             { name: 'Leisure & Hosp.',     unit: 'K',   freq: 'M', tab: 'jobs',     dir: +1, compute: 'mom_diff' },

  // ECI
  ECIALLCIV:         { name: 'ECI Total',           unit: '%',   freq: 'Q', tab: 'eci',      dir: +1, lo: 2,   hi: 6  },
  ECIWAG:            { name: 'ECI Wages',            unit: '%',   freq: 'Q', tab: 'eci',      dir: +1, lo: 2,   hi: 6  },
  ECIBEN:            { name: 'ECI Benefits',         unit: '%',   freq: 'Q', tab: 'eci',      dir: +1, lo: 2,   hi: 6  },

  // CPI
  CPIAUCSL:          { name: 'CPI',                 unit: 'idx', freq: 'M', tab: 'cpi',      dir: -1, compute: 'both' },
  CPILFESL:          { name: 'Core CPI',            unit: 'idx', freq: 'M', tab: 'cpi',      dir: -1, compute: 'both' },
  CUSR0000SAD:       { name: 'Durable Goods CPI',   unit: 'idx', freq: 'M', tab: 'cpi',      dir: -1, compute: 'both' },
  CUSR0000SAS:       { name: 'Services CPI',        unit: 'idx', freq: 'M', tab: 'cpi',      dir: -1, compute: 'both' },
  CUSR0000SAH1:      { name: 'Shelter CPI',         unit: 'idx', freq: 'M', tab: 'cpi',      dir: -1, compute: 'both' },

  // PCE + PPI
  PCEPI:             { name: 'PCE Price Index',     unit: 'idx', freq: 'M', tab: 'pce',      dir: -1, compute: 'both' },
  PCEPILFE:          { name: 'Core PCE',            unit: 'idx', freq: 'M', tab: 'pce',      dir: -1, compute: 'both' },
  PCETRIM12M159SFRBDAL:{ name:'Trimmed Mean PCE 12M',unit:'%',   freq: 'M', tab: 'pce',      dir: -1, lo: 1.5, hi: 5 },
  PPIACO:            { name: 'PPI All Commodities', unit: 'idx', freq: 'M', tab: 'pce',      dir: -1, compute: 'both' },
  WPSFD49116:        { name: 'PPI Finished Goods',  unit: 'idx', freq: 'M', tab: 'pce',      dir: -1, compute: 'both' },

  // Monetary Policy
  FEDFUNDS:          { name: 'Fed Funds Rate',      unit: '%',   freq: 'M', tab: 'monetary', dir: 0,  lo: 0,   hi: 6  },
  DFII10:            { name: '10y TIPS',             unit: '%',   freq: 'D', tab: 'monetary', dir: +1, lo: -1,  hi: 3  },
  T10Y2Y:            { name: 'UST 10y–2y',          unit: 'pp',  freq: 'D', tab: 'monetary', dir: +1, lo: -2,  hi: 2  },
  T10Y3M:            { name: 'UST 10y–3m',          unit: 'pp',  freq: 'D', tab: 'monetary', dir: +1, lo: -2,  hi: 2  },
  STLFSI4:           { name: 'St. Louis FSI',       unit: '',    freq: 'W', tab: 'monetary', dir: -1, lo: -2,  hi: 2  },
  NFCI:              { name: 'Chicago NFCI',        unit: '',    freq: 'W', tab: 'monetary', dir: -1, lo: -1,  hi: 1  },
  WALCL:             { name: 'Fed Assets',          unit: '$B',  freq: 'W', tab: 'monetary', dir: 0,  compute: 'yoy' },
  PSAVERT:           { name: 'Savings Rate',        unit: '%',   freq: 'M', tab: 'monetary', dir: +1, lo: 3,   hi: 12 },
  WRESBAL:           { name: 'Bank Reserves',       unit: '$B',  freq: 'W', tab: 'monetary', dir: 0,  compute: 'yoy' },
  M1SL:              { name: 'M1',                  unit: '$B',  freq: 'M', tab: 'monetary', dir: 0,  compute: 'yoy' },
  M2SL:              { name: 'M2',                  unit: '$B',  freq: 'M', tab: 'monetary', dir: 0,  compute: 'yoy' },

  // Financial Accounts (FRED returns Millions of $; formatter auto-scales to T/B)
  BOGZ1FL192090005Q: { name: 'Household Net Worth', unit: '$M',  freq: 'Q', tab: 'financial', dir: +1, lo: 100e6, hi: 200e6 },
  CCLACBW027SBOG:    { name: 'HH Credit Card Debt', unit: '$B',  freq: 'W', tab: 'financial', dir: -1, lo: 800,    hi: 1200 },
  TNWMVBSNNCB:       { name: 'Corp. Net Worth',     unit: '$M',  freq: 'Q', tab: 'financial', dir: +1, lo: 20e6,   hi: 50e6 },

  // Trade Balance
  BOPGSTB:           { name: 'Trade Balance',       unit: '$M',  freq: 'M', tab: 'trade',    dir: +1, lo:-100000,hi:0   },
  BOPTEXP:           { name: 'Exports',             unit: '$M',  freq: 'M', tab: 'trade',    dir: +1, lo:150000,hi:300000},
  BOPTIMP:           { name: 'Imports',             unit: '$M',  freq: 'M', tab: 'trade',    dir: -1, lo:200000,hi:340000},

  // Fiscal Policy
  MTSDS133FMS:       { name: 'Fed Surplus/Deficit', unit: '$M',  freq: 'M', tab: 'fiscal',   dir: +1, lo:-300000,hi:100000},
  GFDEBTN:           { name: 'Public Debt',         unit: '$M',  freq: 'M', tab: 'fiscal',   dir: -1, lo:10e6, hi:40e6  },
  GFDEGDQ188S:       { name: 'Debt/GDP',            unit: '%',   freq: 'Q', tab: 'fiscal',   dir: -1, lo: 60,  hi: 140  },

  // Market Indexes
  SP500:             { name: 'S&P 500',             unit: 'pts', freq: 'D', tab: 'markets',  dir: +1, compute: 'yoy' },
  NASDAQCOM:         { name: 'NASDAQ',              unit: 'pts', freq: 'D', tab: 'markets',  dir: +1, compute: 'yoy' },
  DJIA:              { name: 'Dow Jones',           unit: 'pts', freq: 'D', tab: 'markets',  dir: +1, compute: 'yoy' },
  VIXCLS:            { name: 'VIX',                 unit: '',    freq: 'D', tab: 'markets',  dir: -1, lo: 10,  hi: 40  },
  BAMLH0A0HYM2:      { name: 'HY Credit Spread',   unit: '%',   freq: 'D', tab: 'markets',  dir: -1, lo: 3,   hi: 10  },
  DGS10:             { name: 'UST 10y Yield',       unit: '%',   freq: 'D', tab: 'markets',  dir: 0,  lo: 1,   hi: 5   },

  // Recession
  USREC:             { name: 'NBER Recession',      unit: '',    freq: 'M', tab: 'recession', dir: 0  },
  RECPROUSM156N:     { name: 'Recession Prob.',     unit: '%',   freq: 'M', tab: 'recession', dir: -1, lo: 0,   hi: 50 },
  NBER_LEADING:      { name: 'Leading Indicators',  unit: 'idx', freq: 'M', tab: 'recession', dir: +1 },
};

// ── USA Heatmap: indicator groups ─────────────────────────────────
const USA_HEATMAP = [
  {
    group: 'Housing Market',
    indicators: [
      { key: 'MORTGAGE30US', label: '30y Mortgage Rate', unit: '%',  dir: -1, lo: 3,   hi: 8   },
      { key: 'PERMIT_YOY',   label: 'Building Permits YoY', unit:'%',dir:+1, lo:-30,  hi: 30  },
      { key: 'UNDCONTSA_YOY',label: 'Houses Under Const. YoY',unit:'%',dir:+1,lo:-20, hi: 20  },
      { key: 'HOUST_YOY',    label: 'Housing Starts YoY',unit: '%',  dir: +1, lo: -30, hi: 30  },
      { key: 'TTLCONS_YOY',  label: 'Const. Spending YoY',unit:'%',  dir: +1, lo: -10, hi: 15  },
      { key: 'EXHOSLUSM495S_YOY',label:'Exist. Home Sales YoY',unit:'%',dir:+1,lo:-30,hi:30  },
      { key: 'HSN1F_YOY',    label: 'New House Sales YoY',unit:'%',  dir: +1, lo: -30, hi: 30  },
      { key: 'MSACSR',       label: 'Monthly Supply',    unit: 'mo', dir: -1, lo: 3,   hi: 9   },
      { key: 'CSUSHPISA_YOY',label: 'Case-Shiller YoY', unit: '%',  dir: +1, lo: -10, hi: 20  },
      { key: 'FIXHAI',       label: 'Affordability Index',unit:'idx',dir: +1, lo: 90, hi: 180 },
    ]
  },
  {
    group: 'Economic Activity',
    indicators: [
      { key: 'NAPM',         label: 'ISM Manufacturing',     unit:'',   dir:+1, lo: 44, hi: 60, neutral: 50 },
      { key: 'NMFCI',        label: 'ISM Services',          unit:'',   dir:+1, lo: 44, hi: 62, neutral: 50 },
      { key: 'NAPMNOI',      label: 'Manuf. New Orders',     unit:'',   dir:+1, lo: 44, hi: 65, neutral: 50 },
      { key: 'NAPMPRI',      label: 'Manuf. Prices Paid',    unit:'',   dir:-1, lo: 40, hi: 80, neutral: 50 },
      { key: 'GACDISA066MSFRBNY', label: 'NY Empire State Mfg', unit:'',dir:+1, lo:-25, hi:25, neutral:0 },
      { key: 'GACDFSA066MSFRBPHI',label: 'Philly Fed Mfg',      unit:'',dir:+1, lo:-25, hi:25, neutral:0 },
      { key: 'PCEC96_YOY',   label: 'Real PCE YoY',          unit: '%', dir: +1, lo: -3,  hi: 8   },
      { key: 'PCES_YOY',     label: 'PCE Services YoY',      unit: '%', dir: +1, lo: -3,  hi: 8   },
      { key: 'PCEDG_YOY',    label: 'PCE Goods YoY',         unit: '%', dir: +1, lo: -15, hi: 20  },
      { key: 'INDPRO_YOY',   label: 'Ind. Production YoY',   unit: '%', dir: +1, lo: -15, hi: 10  },
      { key: 'RSAFS_YOY',    label: 'Retail Sales YoY',      unit: '%', dir: +1, lo: -10, hi: 15  },
      { key: 'RSXFS_YOY',    label: 'Core Retail Sales YoY', unit: '%', dir: +1, lo: -10, hi: 15  },
    ]
  },
  {
    group: 'Labor Market',
    indicators: [
      { key: 'CIVPART',      label: 'LFPR',                  unit: '%', dir: +1, lo: 61,  hi: 67  },
      { key: 'LNS11300060',  label: 'Prime Age LFPR (25-54)',unit: '%', dir: +1, lo: 81,  hi: 84  },
      { key: 'UNRATE',       label: 'Unemployment Rate',     unit: '%', dir: -1, lo: 3,   hi: 8   },
      { key: 'SAHMREALTIME', label: 'Sahm Rule',             unit: 'pp',dir: -1, lo: -0.1,hi: 0.8 },
      { key: 'PAYEMS_MOM',   label: 'Payrolls (K)',          unit: 'K', dir: +1, lo: -100,hi: 500 },
      { key: 'PAYEMS_3M',    label: 'Payrolls 3M Avg',       unit: 'K', dir: +1, lo: -100,hi: 400 },
      { key: 'AHETPI_YOY',   label: 'Hourly Earnings YoY',   unit:'%',  dir: +1, lo: 1,   hi: 6   },
      { key: 'FRBATLWGT3MMAUMHWGO', label: 'Wage Growth Tracker', unit:'%', dir:+1, lo:2, hi:7 },
      { key: 'UEMPMEAN',     label: 'Avg Wks Unemployed',    unit: 'wk',dir:-1, lo: 15,  hi: 35  },
      { key: 'JTSJOR',       label: 'Job Openings Rate',     unit: '%', dir: +1, lo: 3,   hi: 7   },
      { key: 'JOLTS_UNEMPLOY_RATIO', label: 'JOLTs/Unemploy.',unit:'x', dir: +1, lo: 0.6, hi: 2.0 },
      { key: 'ICSA_4WK',     label: 'Initial Claims (4W avg, K)',unit:'K',dir:-1,lo:180,hi:400 },
      { key: 'DSPIC96_YOY',  label: 'RDI YoY',                unit:'%', dir:+1, lo: -5,  hi: 8   },
      { key: 'W875RX1_YOY',  label: 'RDI Ex-Gov YoY',         unit:'%', dir:+1, lo: -5,  hi: 8   },
    ]
  },
  {
    group: 'Inflation',
    indicators: [
      { key: 'CPIAUCSL_MOM', label: 'CPI MoM',           unit: '%', dir: -1, lo: -0.2,hi: 0.8 },
      { key: 'CPILFESL_MOM', label: 'Core-CPI MoM',      unit: '%', dir: -1, lo: 0,   hi: 0.6 },
      { key: 'CUSR0000SAD_MOM',label:'Durables CPI MoM', unit: '%', dir: -1, lo: -0.5,hi: 0.5 },
      { key: 'CUSR0000SAS_MOM',label:'Services CPI MoM', unit: '%', dir: -1, lo: 0,   hi: 0.7 },
      { key: 'CUSR0000SAH1_MOM',label:'Shelter CPI MoM', unit: '%', dir: -1, lo: 0,   hi: 0.8 },
      { key: 'CPIAUCSL_YOY', label: 'CPI YoY',           unit: '%', dir: -1, lo: 0,   hi: 9   },
      { key: 'CPILFESL_YOY', label: 'Core-CPI YoY',      unit: '%', dir: -1, lo: 0,   hi: 8   },
      { key: 'CUSR0000SAD_YOY',label:'Durables CPI YoY', unit: '%', dir: -1, lo: -5,  hi: 15  },
      { key: 'CUSR0000SAS_YOY',label:'Services CPI YoY', unit: '%', dir: -1, lo: 0,   hi: 8   },
      { key: 'CUSR0000SAH1_YOY',label:'Shelter CPI YoY', unit: '%', dir: -1, lo: 0,   hi: 10  },
      { key: 'PCEPI_MOM',    label: 'PCE MoM',           unit: '%', dir: -1, lo: -0.2,hi: 0.8 },
      { key: 'PCEPILFE_MOM', label: 'Core-PCE MoM',      unit: '%', dir: -1, lo: 0,   hi: 0.6 },
      { key: 'PCEPI_YOY',    label: 'PCE YoY',           unit: '%', dir: -1, lo: 0,   hi: 7   },
      { key: 'PCEPILFE_YOY', label: 'Core-PCE YoY',      unit: '%', dir: -1, lo: 0,   hi: 6   },
      { key: 'PCETRIM12M159SFRBDAL', label: 'Trimmed Mean PCE 12M', unit:'%', dir:-1, lo:1.5, hi:5 },
    ]
  },
  {
    group: 'Monetary Policy',
    indicators: [
      { key: 'FEDFUNDS',     label: 'Fed Funds Rate',    unit: '%', dir: 0,  lo: 0,   hi: 6   },
      { key: 'DFII10',       label: '10y TIPS',          unit: '%', dir: +1, lo: -1,  hi: 3   },
      { key: 'T10Y2Y',       label: 'UST 10y–2y',        unit: 'pp',dir: +1, lo: -2,  hi: 2.5 },
      { key: 'T10Y3M',       label: 'UST 10y–3m',        unit: 'pp',dir: +1, lo: -2,  hi: 2.5 },
      { key: 'STLFSI4',      label: 'St. Louis FSI',     unit: '',  dir: -1, lo: -2,  hi: 3   },
      { key: 'NFCI',         label: 'Chicago NFCI',      unit: '',  dir: -1, lo: -1,  hi: 1.5 },
      { key: 'WALCL_YOY',    label: 'Fed Assets YoY',   unit: '%', dir: 0,  lo: -20, hi: 30  },
      { key: 'PSAVERT',      label: 'Savings Rate',      unit: '%', dir: +1, lo: 3,   hi: 15  },
      { key: 'M1SL_YOY',     label: 'M1 YoY',           unit: '%', dir: 0,  lo: -20, hi: 40  },
      { key: 'M2SL_YOY',     label: 'M2 YoY',           unit: '%', dir: 0,  lo: -5,  hi: 30  },
    ]
  },
];

// ── Brazil: BACEN series ──────────────────────────────────────────
// IDs from the SGS row A in the user's "HeatMap Brasil" spreadsheet
const BACEN_SERIES = {
  // ── Atividade ──
  21637: { name: 'Vol. Nominal Serviços',     unit: 'idx', tab: 'atividade', dir: +1, compute: 'both' },
  23982: { name: 'Volume de Serviços',        unit: 'idx', tab: 'atividade', dir: +1, compute: 'both' },
  28503: { name: 'Produção Industrial',       unit: 'idx', tab: 'atividade', dir: +1, compute: 'both' },
  28473: { name: 'Vendas no Varejo',          unit: 'idx', tab: 'atividade', dir: +1, compute: 'both' },
  28485: { name: 'Comércio Ampliado',         unit: 'idx', tab: 'atividade', dir: +1, compute: 'both' },
  24364: { name: 'IBC-Br',                    unit: 'idx', tab: 'atividade', dir: +1, compute: 'both' },
  29608: { name: 'IBC-Br Ex-Agro',            unit: 'idx', tab: 'atividade', dir: +1, compute: 'both' },
  // Confiança (FGV) — proxy series
  4393:  { name: 'Confiança Consumidor',      unit: 'pts', tab: 'atividade', dir: +1, lo: 60,  hi: 120 },
  4394:  { name: 'Cond. Econ. Atuais',        unit: 'pts', tab: 'atividade', dir: +1, lo: 60,  hi: 120 },
  4395:  { name: 'Expectativas Futuras',      unit: 'pts', tab: 'atividade', dir: +1, lo: 60,  hi: 120 },

  // ── PIB ──
  22108: { name: 'PIB (VAB)',                 unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },
  22109: { name: 'PIB (Preços Mercado)',      unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },
  22110: { name: 'Consumo Famílias',          unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },
  22111: { name: 'Gastos Governo',            unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },
  22113: { name: 'FBKF (Investimento)',       unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },
  22114: { name: 'Exportações',               unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },
  22115: { name: 'Importações',               unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },
  22105: { name: 'PIB Agropecuária',          unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },
  22106: { name: 'PIB Indústria',             unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },
  22107: { name: 'PIB Serviços',              unit: 'idx', tab: 'pib',       dir: +1, compute: 'yoy' },

  // ── Inflação ──
  433:   { name: 'IPCA MoM',                  unit: '%',   tab: 'inflacao',  dir: -1, lo: -0.5,hi: 2   },
  13522: { name: 'IPCA YoY',                  unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 12  },
  7478:  { name: 'IPCA-15',                   unit: '%',   tab: 'inflacao',  dir: -1, lo: -0.5,hi: 2   },
  21379: { name: 'Índice de Difusão',         unit: '%',   tab: 'inflacao',  dir: -1, lo: 40,  hi: 75  },
  10843: { name: 'IPCA Bens MoM',             unit: '%',   tab: 'inflacao',  dir: -1, lo: -0.5,hi: 2   },
  10844: { name: 'IPCA Serviços MoM',         unit: '%',   tab: 'inflacao',  dir: -1, lo: -0.5,hi: 1.5 },
  4467:  { name: 'Núcleo IPC-Br (FGV)',       unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 1.5 },
  27574: { name: 'IC-Br',                     unit: 'idx', tab: 'inflacao',  dir: 0,  compute: 'yoy' },
  // IPCA grupos
  1635:  { name: 'IPCA Alimentação',          unit: '%',   tab: 'inflacao',  dir: -1, lo: -1,  hi: 2  },
  1636:  { name: 'IPCA Habitação',            unit: '%',   tab: 'inflacao',  dir: -1, lo: -0.5,hi: 1.5 },
  1637:  { name: 'IPCA Residência',           unit: '%',   tab: 'inflacao',  dir: -1, lo: -0.5,hi: 1.5 },
  1638:  { name: 'IPCA Vestuário',            unit: '%',   tab: 'inflacao',  dir: -1, lo: -1,  hi: 2  },
  1639:  { name: 'IPCA Transportes',          unit: '%',   tab: 'inflacao',  dir: -1, lo: -1,  hi: 2.5 },
  1640:  { name: 'IPCA Comunicação',          unit: '%',   tab: 'inflacao',  dir: -1, lo: -0.5,hi: 1.5 },
  1641:  { name: 'IPCA Saúde',                unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 1.5 },
  1642:  { name: 'IPCA Despesas Pessoais',    unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 1.5 },
  1643:  { name: 'IPCA Educação',             unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 6   },
  // Núcleos
  4466:  { name: 'Núcleo IPCA-MS',            unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 1.5 },
  11427: { name: 'Núcleo IPCA-EX0',           unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 1.5 },
  16122: { name: 'Núcleo IPCA-DP',            unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 1.5 },
  27839: { name: 'Núcleo IPCA-EX3',           unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 1.5 },
  28750: { name: 'Núcleo IPCA-P55',           unit: '%',   tab: 'inflacao',  dir: -1, lo: 0,   hi: 1.5 },
  189:   { name: 'IGP-M MoM',                 unit: '%',   tab: 'inflacao',  dir: -1, lo: -1,  hi: 3   },

  // Mercado de Trabalho
  24369: { name: 'Taxa de Desemprego',        unit: '%',   tab: 'trabalho',  dir: -1, lo: 7,   hi: 15  },
  24379: { name: 'Pessoas Ocupadas',          unit: 'M',   tab: 'trabalho',  dir: +1, compute: 'yoy' },
  28763: { name: 'CAGED',                     unit: 'K',   tab: 'trabalho',  dir: +1, lo: -500,hi: 400, compute: 'mom_diff' },
  24382: { name: 'Renda Real c/ Carteira',    unit: 'R$',  tab: 'trabalho',  dir: +1, compute: 'yoy' },
  24385: { name: 'Renda Setor Privado',       unit: 'R$',  tab: 'trabalho',  dir: +1, compute: 'yoy' },

  // Política Fiscal
  13761: { name: 'Dívida Bruta',             unit: 'R$B', tab: 'fiscal',    dir: -1, compute: 'yoy' },
  13762: { name: 'Dívida Bruta/PIB',         unit: '%',   tab: 'fiscal',    dir: -1, lo: 60,  hi: 95  },
  4513:  { name: 'Dívida Líquida/PIB',       unit: '%',   tab: 'fiscal',    dir: -1, lo: 30,  hi: 70  },
  4144:  { name: 'Resultado Primário',        unit: 'R$M', tab: 'fiscal',    dir: +1, lo:-50000,hi:20000},
  5793:  { name: 'Resultado Primário/PIB',    unit: '%',   tab: 'fiscal',    dir: +1, lo: -5,  hi: 2   },
  5727:  { name: 'Resultado Nominal/PIB',     unit: '%',   tab: 'fiscal',    dir: +1, lo: -12, hi: 0   },
  2150:  { name: 'Resultado Empresas Federais',  unit: 'R$M', tab: 'fiscal', dir: +1, lo:-5000, hi:5000 },
  2151:  { name: 'Resultado Empresas Estaduais', unit: 'R$M', tab: 'fiscal', dir: +1, lo:-3000, hi:3000 },
  2152:  { name: 'Resultado Empresas Municipais',unit: 'R$M', tab: 'fiscal', dir: +1, lo: -300, hi: 300 },

  // Crédito
  20539: { name: 'Saldo de Crédito Total',   unit: 'R$B', tab: 'credito',   dir: +1, compute: 'yoy' },
  20540: { name: 'Crédito PJ',              unit: 'R$B', tab: 'credito',   dir: +1, compute: 'yoy' },
  20541: { name: 'Crédito PF',             unit: 'R$B', tab: 'credito',   dir: +1, compute: 'yoy' },
  20631: { name: 'Concessão de Crédito',     unit: 'R$B', tab: 'credito',   dir: +1, compute: 'yoy' },
  25351: { name: 'ICC',                       unit: '%',   tab: 'credito',   dir: -1, lo: 15,  hi: 30  },
  21082: { name: 'Inadimplência Total',      unit: '%',   tab: 'credito',   dir: -1, lo: 2,   hi: 6   },
  21083: { name: 'Inadimplência PJ',         unit: '%',   tab: 'credito',   dir: -1, lo: 1,   hi: 5   },
  21084: { name: 'Inadimplência PF',         unit: '%',   tab: 'credito',   dir: -1, lo: 2,   hi: 7   },
  21146: { name: 'Inadimplência Agro',       unit: '%',   tab: 'credito',   dir: -1, lo: 1,   hi: 8   },
  29034: { name: 'Endividamento Familiar',   unit: '%',   tab: 'credito',   dir: -1, lo: 40,  hi: 60  },
  29035: { name: 'Comprometimento Renda',    unit: '%',   tab: 'credito',   dir: -1, lo: 20,  hi: 30  },

  // Agregados Monetários
  1788:  { name: 'Base Monetária',           unit: 'R$B', tab: 'agregados', dir: +1, compute: 'yoy' },
  27791: { name: 'M1',                        unit: 'R$B', tab: 'agregados', dir: +1, compute: 'yoy' },
  27810: { name: 'M2',                        unit: 'R$B', tab: 'agregados', dir: +1, compute: 'yoy' },
  4189:  { name: 'Selic Mensal Anualizada',   unit: '%',   tab: 'agregados', dir: 0,  lo: 2,   hi: 15  },
  1178:  { name: 'Selic Over',                unit: '%',   tab: 'agregados', dir: 0,  lo: 2,   hi: 15  },

  // Setor Externo
  22701: { name: 'Transações Correntes',     unit: '$M',  tab: 'externo',   dir: +1, lo:-20000,hi:5000 },
  23079: { name: 'TC/PIB',                   unit: '%',   tab: 'externo',   dir: +1, lo: -5,  hi: 2   },
  22708: { name: 'Exportações Bens',         unit: '$M',  tab: 'externo',   dir: +1, compute: 'yoy' },
  22709: { name: 'Importações Bens',         unit: '$M',  tab: 'externo',   dir: +1, compute: 'yoy' },
  22707: { name: 'Balança de Bens',          unit: '$M',  tab: 'externo',   dir: +1, lo:-5000, hi:15000 },
  22720: { name: 'Exportações Serviços',     unit: '$M',  tab: 'externo',   dir: +1, compute: 'yoy' },
  22721: { name: 'Importações Serviços',     unit: '$M',  tab: 'externo',   dir: -1, compute: 'yoy' },
  22719: { name: 'Balança de Serviços',      unit: '$M',  tab: 'externo',   dir: +1, lo:-8000, hi:0    },
  22800: { name: 'Renda Primária',           unit: '$M',  tab: 'externo',   dir: +1, lo:-15000,hi:5000 },
  22838: { name: 'Renda Secundária',         unit: '$M',  tab: 'externo',   dir: +1, lo: 0,   hi:5000 },
  22851: { name: 'Conta Capital',            unit: '$M',  tab: 'externo',   dir: 0,  lo: 0,   hi:200  },
  22863: { name: 'Conta Financeira',         unit: '$M',  tab: 'externo',   dir: 0,  lo:-15000,hi:15000},
  22865: { name: 'IDE no Exterior',          unit: '$M',  tab: 'externo',   dir: 0,  lo:-5000, hi:8000 },
  22885: { name: 'IDP',                      unit: '$M',  tab: 'externo',   dir: +1, lo: 0,   hi:15000},
  22886: { name: 'Ingressos IDP',            unit: '$M',  tab: 'externo',   dir: +1, lo: 0,   hi:20000},
  22887: { name: 'Saídas IDP',               unit: '$M',  tab: 'externo',   dir: -1, lo:-15000,hi: 0   },
  23080: { name: 'IDP/PIB',                  unit: '%',   tab: 'externo',   dir: +1, lo: 0,   hi: 5   },
  3546:  { name: 'Reservas Internacionais',  unit: '$M',  tab: 'externo',   dir: +1, lo:300000,hi:400000},
};

// ── Brazil Heatmap ────────────────────────────────────────────────
const BRAZIL_HEATMAP = [
  {
    group: 'Atividade',
    indicators: [
      { key: 4393,  label: 'Confiança Consumidor',       unit: 'pts', dir: +1, lo: 70,  hi: 120 },
      { key: 4394,  label: 'Cond. Econômicas Atuais',   unit: 'pts', dir: +1, lo: 70,  hi: 120 },
      { key: 4395,  label: 'Expectativas Futuras',       unit: 'pts', dir: +1, lo: 70,  hi: 120 },
      { key: '23982_MOM', label: 'Volume Serviços MoM',  unit: '%',   dir: +1, lo: -3,  hi: 3   },
      { key: '21637_MOM', label: 'Vol. Nominal Serv. MoM',unit:'%',  dir: +1, lo: -3,  hi: 3   },
      { key: '28503_MOM', label: 'Prod. Industrial MoM', unit: '%',   dir: +1, lo: -5,  hi: 5   },
      { key: '28473_MOM', label: 'Varejo MoM',           unit: '%',   dir: +1, lo: -5,  hi: 5   },
      { key: '28485_MOM', label: 'Comércio Ampliado MoM',unit: '%',  dir: +1, lo: -5,  hi: 5   },
      { key: '24364_MOM', label: 'IBC-Br MoM',           unit: '%',   dir: +1, lo: -3,  hi: 3   },
      { key: '23982_YOY', label: 'Volume Serviços YoY',  unit: '%',   dir: +1, lo: -10, hi: 15  },
      { key: '21637_YOY', label: 'Vol. Nominal Serv. YoY',unit:'%',  dir: +1, lo: -10, hi: 15  },
      { key: '28503_YOY', label: 'Prod. Industrial YoY', unit: '%',   dir: +1, lo: -15, hi: 15  },
      { key: '28473_YOY', label: 'Varejo YoY',           unit: '%',   dir: +1, lo: -10, hi: 15  },
      { key: '28485_YOY', label: 'Comércio Ampliado YoY',unit: '%',  dir: +1, lo: -10, hi: 15  },
      { key: '24364_YOY', label: 'IBC-Br YoY',           unit: '%',   dir: +1, lo: -10, hi: 10  },
    ]
  },
  {
    group: 'Índices de Preços',
    indicators: [
      { key: 433,   label: 'IPCA MoM',                    unit: '%',   dir: -1, lo: -0.3,hi: 1.5 },
      { key: 'NUCLEO_MOM', label: 'Média Núcleos MoM',    unit: '%',   dir: -1, lo: 0,   hi: 1   },
      { key: 10843, label: 'IPCA Bens MoM',               unit: '%',   dir: -1, lo: -0.5,hi: 1.5 },
      { key: 10844, label: 'IPCA Serviços MoM',           unit: '%',   dir: -1, lo: 0,   hi: 1.2 },
      { key: 189,   label: 'IGP-M MoM',                   unit: '%',   dir: -1, lo: -1,  hi: 3   },
      { key: 13522, label: 'IPCA YoY',                    unit: '%',   dir: -1, lo: 1,   hi: 12  },
      { key: 'NUCLEO_YOY', label: 'Núcleo YoY',           unit: '%',   dir: -1, lo: 2,   hi: 8   },
      { key: 'NUCLEO_3M_A', label: 'Núcleo 3M Anualizado',unit: '%',   dir: -1, lo: 2,   hi: 8   },
      { key: 'NUCLEO_6M_A', label: 'Núcleo 6M Anualizado',unit: '%',   dir: -1, lo: 2,   hi: 8   },
      { key: '10844_6M_A',  label: 'Serviços 6M Anualiz.',unit: '%',   dir: -1, lo: 2,   hi: 8   },
      { key: 21379, label: 'Índice de Difusão',           unit: '%',   dir: -1, lo: 40,  hi: 75  },
    ]
  },
  {
    group: 'Mercado de Trabalho',
    indicators: [
      { key: 24369, label: 'Taxa de Desemprego',          unit: '%',   dir: -1, lo: 7,   hi: 15  },
      { key: '28763_MOM', label: 'CAGED MoM',              unit: 'K',   dir: +1, lo: -200000,hi: 300000 },
      { key: '28763_3M',  label: 'CAGED 3M Avg',          unit: 'K',   dir: +1, lo: -100000,hi: 250000 },
      { key: '24382_YOY', label: 'Renda Real c/ Cart. YoY',unit:'%',  dir: +1, lo: -5,  hi: 8   },
      { key: '24385_YOY', label: 'Renda Setor Priv. YoY', unit: '%',  dir: +1, lo: -5,  hi: 8   },
    ]
  },
  {
    group: 'Crédito & Monetário',
    indicators: [
      { key: '20539_YOY', label: 'Crédito Total YoY',    unit: '%',   dir: +1, lo: -5,  hi: 20  },
      { key: '20540_YOY', label: 'Crédito PJ YoY',       unit: '%',   dir: +1, lo: -10, hi: 25  },
      { key: '20541_YOY', label: 'Crédito PF YoY',      unit: '%',   dir: +1, lo: -5,  hi: 20  },
      { key: 25351, label: 'ICC',                          unit: '%',   dir: -1, lo: 15,  hi: 30  },
      { key: 21082, label: 'Inadimplência Total',         unit: '%',   dir: -1, lo: 2,   hi: 6   },
      { key: 21083, label: 'Inadimplência PJ',           unit: '%',   dir: -1, lo: 1,   hi: 5   },
      { key: 21084, label: 'Inadimplência PF',          unit: '%',   dir: -1, lo: 2,   hi: 7   },
      { key: 29034, label: 'Endividamento Familiar',      unit: '%',   dir: -1, lo: 40,  hi: 60  },
      { key: 29035, label: 'Comprometimento Renda',       unit: '%',   dir: -1, lo: 20,  hi: 30  },
      { key: '1788_YOY', label: 'Base Monetária YoY',    unit: '%',   dir: 0,  lo: -10, hi: 30  },
      { key: '27810_YOY', label: 'M2 YoY',               unit: '%',   dir: 0,  lo: -5,  hi: 25  },
    ]
  },
  {
    group: 'Fiscal',
    indicators: [
      { key: 13762, label: 'Dívida Bruta/PIB',           unit: '%',   dir: -1, lo: 65,  hi: 92  },
      { key: 4513,  label: 'Dívida Líquida/PIB',        unit: '%',   dir: -1, lo: 30,  hi: 65  },
      { key: 5793,  label: 'Resultado Primário/PIB',     unit: '%',   dir: +1, lo: -5,  hi: 2   },
    ]
  },
];

// ── Chart definitions per tab ──────────────────────────────────────
const USA_CHARTS = {
  housing: [
    {
      title: '30y Mortgage Rate (%)', type: 'line', series: ['MORTGAGE30US'],
      explanation: {
        what: 'Taxa média de financiamento imobiliário de 30 anos (Freddie Mac PMMS). Acompanha de perto o Treasury de 10 anos + spread.',
        up:   'Custo de financiamento sobe → demanda por imóveis cai → preços e construção desaceleram. Aluguéis tendem a subir (gente preferindo alugar).',
        down: 'Taxas caindo destravam refinanciamentos e novas compras. Construção residencial reativa.',
        why:  'O setor imobiliário (~15% do PIB) é o canal mais rápido pelo qual juros do Fed afetam a economia real. Hipoteca acima de 7% historicamente trava o mercado.'
      }
    },
    {
      title: 'Housing Starts & Building Permits (K)', type: 'bar', series: ['HOUST', 'PERMIT'],
      explanation: {
        what: 'Permits = autorizações para iniciar construção (leading). Starts = obras efetivamente iniciadas (coincident). Em milhares de unidades anualizadas.',
        up:   'Construtores otimistas, demanda por moradia aquecida. Anuncia atividade industrial (cimento, aço, eletrodomésticos).',
        down: 'Quedas significativas (>20% YoY) historicamente antecedem recessões em 6-12 meses.',
        why:  'É um dos componentes oficiais do Conference Board Leading Economic Index. Mercado imobiliário travado deprime a economia inteira.'
      }
    },
    {
      title: 'New Home Sales (K)', type: 'line', series: ['HSN1F'],
      explanation: {
        what: 'Vendas mensais de imóveis novos unifamiliares (Census Bureau), em milhares anualizados. Cobre ~10% do mercado total.',
        up:   'Mercado aquecido. Sensível ao ciclo de juros — sobe rápido quando taxas caem (compra é nova, não há lock-in effect).',
        down: 'Quedas significativas (>20% YoY) historicamente antecedem desacelerações. Construtores adiam novos projetos.',
        why:  'New Home Sales é o segmento mais cíclico e responsivo a política monetária. Move antes do Existing (Existing tem "lock-in effect" pelo refi).'
      }
    },
    {
      title: 'Existing Home Sales (K)', type: 'line', series: ['EXHOSLUSM495S'],
      explanation: {
        what: 'Vendas mensais de imóveis usados/revendas (NAR), em milhares anualizados. ~90% do mercado total. ATENÇÃO: o FRED redefiniu a série em março/2025 — histórico anterior não disponível pela API.',
        up:   'Mercado de revenda destravando. Aumenta mobilidade e gastos relacionados (móveis, reformas, financiamento).',
        down: 'Mercado travado (efeito "lock-in" — donos com hipoteca antiga de 3% relutam em trocar por uma nova de 7%). Reduz mobilidade habitacional e renovação.',
        why:  'É o termômetro do mercado imobiliário "real" (a maioria das transações). Quando trava, derruba indústrias correlatas: corretagem, mudanças, móveis, eletrodomésticos.'
      }
    },
    {
      title: 'Case-Shiller YoY (%)', type: 'line', series: ['CSUSHPISA_YOY'],
      explanation: {
        what: 'Variação anual do índice S&P/Case-Shiller de preços de imóveis residenciais (média de 20 metrópoles).',
        up:   'Preços subindo: efeito riqueza positivo (donos se sentem mais ricos, gastam mais). Mas pressiona affordability.',
        down: 'Quedas raras historicamente. Quedas significativas (>5%) sinalizam crise (vide 2008).',
        why:  'Riqueza imobiliária é ~30% da riqueza das famílias americanas. Movimentos no Case-Shiller afetam consumo via wealth effect.'
      }
    },
    {
      title: 'Affordability Index (NAR Fixed Rate)', type: 'line', series: ['FIXHAI'],
      explanation: {
        what: 'Índice da NAR: 100 = renda mediana cobre exatamente a hipoteca de uma casa mediana. Acima de 100 = mais affordable.',
        up:   'Acessibilidade melhorando: ou renda subiu, ou preços caíram, ou hipoteca barateou.',
        down: 'Affordability deteriorando: combinação de preços altos + hipoteca cara + renda estagnada. Sinaliza demanda reprimida.',
        why:  'Quando o índice está abaixo de 100 por muito tempo, demanda colapsa. Foi <100 em 2022-2024, momento de paralisia do mercado.'
      }
    },
    {
      title: 'Monthly Supply (months)', type: 'line', series: ['MSACSR'],
      explanation: {
        what: 'Quantos meses levaria para vender o estoque atual de casas no ritmo atual de vendas. Calculado mensalmente.',
        up:   'Estoque acumulando: oferta > demanda. Pressão para baixo nos preços.',
        down: 'Estoque escasso: demanda > oferta. Pressão para alta nos preços. Abaixo de 5 meses = mercado de vendedor.',
        why:  '4-6 meses é considerado equilíbrio. Acima de 8-10 meses historicamente associado a quedas de preço (2008 chegou a 12+).'
      }
    },
  ],

  activity: [
    {
      title: 'Regional Fed Mfg Surveys (NY & Philly)', type: 'line',
      series: ['GACDISA066MSFRBNY','GACDFSA066MSFRBPHI'], refLine: 0,
      explanation: {
        what: 'Pesquisas regionais com fabricantes de NY e Philadelphia. Acima de 0 = expansão; abaixo = contração.',
        up:   'Indústria regional acelerando. Empire State e Philly Fed são leading indicators do ISM Manufacturing nacional.',
        down: 'Contração industrial. Quedas profundas (<-15) historicamente associadas a recessões.',
        why:  'São os primeiros dados de manufactura disponíveis a cada mês (saem antes do ISM). Mercados acompanham para antecipar decisões do Fed.'
      }
    },
    {
      title: 'Real PCE YoY (%)', type: 'bar', series: ['PCEC96_YOY'],
      explanation: {
        what: 'Crescimento anual do gasto pessoal real (deflacionado). Consumo é ~70% do PIB americano.',
        up:   'Consumidor gastando: economia em expansão. Acima de 3% YoY é ritmo forte.',
        down: 'Consumo desacelerando ou contraindo. Quedas em PCE real são raras e historicamente associadas a recessões.',
        why:  'É o indicador mais importante para a economia americana, dado o peso do consumo. Fed observa para calibrar política monetária.'
      }
    },
    {
      title: 'PCE Services & Goods YoY (%)', type: 'line', series: ['PCES_YOY','PCEDG_YOY'],
      explanation: {
        what: 'Decomposição do gasto pessoal em Serviços (~65% do total) e Bens Duráveis (eletrônicos, carros, móveis — mais cíclicos).',
        up:   'Bens Duráveis acelerando: confiança alta, financiamento disponível. Serviços acelerando: economia robusta no setor maior.',
        down: 'Bens Duráveis caem PRIMEIRO em desacelerações (são compras adiáveis). Serviços teimam mais (saúde, aluguel são incompressíveis).',
        why:  'O gap entre Serviços e Bens revela o estágio do ciclo. Bens caindo enquanto Serviços resistem = freada inicial. Ambos caindo = recessão.'
      }
    },
    {
      title: 'Retail Sales YoY (%)', type: 'line', series: ['RSAFS_YOY', 'RSXFS_YOY'],
      explanation: {
        what: 'Total Retail Sales vs Core Retail Sales (exclui veículos, gasolina, materiais de construção, food services). Core é menos volátil.',
        up:   'Consumidor gastando em bens. Core Retail é melhor proxy do consumo subjacente.',
        down: 'Quando Total cai mas Core sobe: queda foi impulsionada por gasolina/carros (commodities). Quando Core cai: freada de verdade.',
        why:  'Dado mensal de alta frequência. Mercado reage forte ao Core Retail Sales (o que entra no GDP nowcasting).'
      }
    },
    {
      title: 'Industrial Production YoY (%)', type: 'bar', series: ['INDPRO_YOY'],
      explanation: {
        what: 'Variação anual da produção industrial (manufatura + mineração + utilities). Pesado na manufatura.',
        up:   'Indústria expandindo: investimento em capacidade, demanda por bens duráveis, exportações fortes.',
        down: 'Quedas de IP YoY historicamente associadas a recessões. -2% a -3% sustentado é sinal claro.',
        why:  'Embora indústria seja só ~12% do PIB americano, é altamente cíclica e leading indicator do ciclo econômico.'
      }
    },
  ],

  pmi: [
    {
      title: 'ISM Manufacturing PMI (>50 = expansion)', type: 'line', series: ['NAPM'], refLine: 50,
      explanation: {
        what: 'Pesquisa mensal com gerentes de compras industriais. Composto de 5 sub-índices. >50 = expansão; <50 = contração.',
        up:   'PMI subindo (especialmente cruzando 50): indústria voltando a expandir. Mercados sobem em antecipação.',
        down: 'Abaixo de 47-48 sustentadamente: recessão industrial. Abaixo de 45: tipicamente recessão econômica geral.',
        why:  'É o indicador antecedente mais respeitado do ciclo industrial americano. Disponível ~1 dia útil após o fim do mês.'
      }
    },
    {
      title: 'ISM Services PMI (>50 = expansion)', type: 'line', series: ['NMFCI'], refLine: 50,
      explanation: {
        what: 'Equivalente do ISM Manufacturing para o setor de Serviços (~80% da economia americana).',
        up:   'Serviços expandindo: economia robusta. Setor é menos cíclico que indústria, então quedas são mais raras.',
        down: 'Quando Services cai abaixo de 50, é sinal MUITO forte de freada (raro historicamente).',
        why:  'Por ser o setor maior, ISM Services tem peso enorme nas decisões do Fed. Acima de 55 = expansão forte.'
      }
    },
    {
      title: 'ISM Manufacturing — Components', type: 'line', series: ['NAPM','NAPMNOI','NAPMEI'], refLine: 50,
      explanation: {
        what: 'Headline + sub-índices: New Orders (mais leading), Employment (impacto no emprego industrial).',
        up:   'New Orders subindo antes do Headline: bom sinal forward-looking. Employment subindo: empresas confiantes.',
        down: 'New Orders caindo > Headline: deterioração à frente. Employment caindo: demissões industriais.',
        why:  'New Orders é o melhor sub-índice como leading indicator. Diverge do Headline em pontos de inflexão.'
      }
    },
    {
      title: 'ISM Services — Components', type: 'line', series: ['NMFCI','NMFNOI','NMFEI'], refLine: 50,
      explanation: {
        what: 'Headline + sub-índices: New Orders, Employment, Business Activity. >50 = expansão.',
        up:   'Componentes saudáveis: motor doméstico forte. Employment > 50 sustentadamente sinaliza criação de emprego.',
        down: 'New Orders caindo: pressão à frente. Employment cruzando 50 para baixo: prelúdio de demissões.',
        why:  'Setor de serviços emprega ~80% dos trabalhadores americanos. Qualquer fraqueza aqui tem grande impacto agregado.'
      }
    },
    {
      title: 'Prices Paid — Manufacturing vs Services', type: 'line', series: ['NAPMPRI','NMFPRI'], refLine: 50,
      explanation: {
        what: 'Sub-índices de preços pagos pelas empresas por insumos. >50 = preços subindo; <50 = caindo.',
        up:   'Pressão inflacionária na cadeia de suprimentos. Antecede CPI/PCE em 1-3 meses.',
        down: 'Empresas conseguindo reduzir custos. Anuncia desinflação à frente.',
        why:  'É o melhor leading indicator de inflação que existe. Fed acompanha de perto. Acima de 70 historicamente associado a inflação >5%.'
      }
    },
    {
      title: 'Regional Fed Mfg (free substitute) — Empire State vs Philly', type: 'line',
      series: ['GACDISA066MSFRBNY','GACDFSA066MSFRBPHI'], refLine: 0,
      explanation: {
        what: 'Pesquisas regionais do Fed (NY e Philly) usadas como proxy gratuito do ISM (que é pago).',
        up:   'Convergência ascendente entre os dois: sinal forte de expansão industrial nacional.',
        down: 'Divergência (um sobe, outro cai): ruído regional. Ambos caindo: confirma fraqueza.',
        why:  'Correlação de ~0.85 com ISM Manufacturing. Permite acompanhar o ciclo industrial mesmo sem acesso pago ao ISM.'
      }
    },
  ],

  gdp: [
    {
      title: 'Real GDP Growth — QoQ Annualized (%)', type: 'bar', series: ['A191RL1Q225SBEA'],
      explanation: {
        what: 'Variação trimestral anualizada do PIB real (ex: +2% trimestral × 4 = +8% anualizado, simplificado).',
        up:   'Acima de 2% anualizado: economia rodando perto do potencial. Acima de 3% sustentado: aquecimento.',
        down: 'Negativo por 2 trimestres = recessão técnica. Quedas de 2-3% pontuais são absorvíveis se rapidamente revertidas.',
        why:  'É a métrica oficial divulgada pelo BEA a cada trimestre (3 estimativas: advance, second, third). Move mercados significativamente.'
      }
    },
    {
      title: 'Real GDP YoY (%)', type: 'line', series: ['GDPC1_YOY'],
      explanation: {
        what: 'Crescimento anual do PIB real. Mais suave que QoQ — mostra a tendência subjacente.',
        up:   'YoY > 2.5%: crescimento acima do potencial (PIB potencial americano ~1.8-2%). Pode ser inflacionário.',
        down: 'YoY abaixo de 1%: estagnação. Negativo: recessão.',
        why:  'Métrica para comparações de longo prazo. EUA cresce historicamente ~2% ao ano (1950-2024).'
      }
    },
    {
      title: 'GDP Demand Components YoY (%)', type: 'line', series: ['PCEC96_YOY','GPDIC1_YOY','GCEC1_YOY'],
      explanation: {
        what: 'Decomposição do PIB em Consumo (PCE), Investimento Privado (GPDI), Gastos do Governo (GCE).',
        up:   'Investimento puxando: crescimento sustentável e produtivo. Consumo sólido: boa base. Gastos do governo: pode ser estímulo.',
        down: 'Investimento caindo é o pior sinal — antecipa freada (empresas cortam capex antes de tudo).',
        why:  'Qualidade do crescimento importa: investimento gera capacidade futura; consumo apenas é aproveitamento. Governo financiando crescimento via déficit é sustentável só por tempo limitado.'
      }
    },
    {
      title: 'Private Investment YoY (%)', type: 'bar', series: ['GPDIC1_YOY'],
      explanation: {
        what: 'Crescimento anual do investimento privado bruto (capex empresarial + residencial + estoques).',
        up:   'Empresas investindo: confiança no futuro. Antecipa crescimento de produtividade e empregos.',
        down: 'Quedas significativas (>5%) historicamente quase sempre coincidem com recessões.',
        why:  'É o componente mais cíclico e volátil do PIB. Empresas cortam capex no primeiro sinal de problema.'
      }
    },
    {
      title: 'Government Expenditures YoY (%)', type: 'bar', series: ['GCEC1_YOY'],
      explanation: {
        what: 'Crescimento anual dos gastos reais do governo federal + estadual + municipal.',
        up:   'Estímulo fiscal: governo gastando mais. Pode ser pró-cíclico (boom inflacionário) ou contracíclico (recuperação pós-recessão).',
        down: 'Contração fiscal: governo cortando. Pode ajudar a controlar inflação mas também desacelera.',
        why:  'Gastos do governo são ~17% do PIB americano. Em recessões, essa parcela tende a expandir relativamente (estabilizador automático).'
      }
    },
  ],

  labor: [
    {
      title: 'Unemployment Rate (%)', type: 'line', series: ['UNRATE'],
      explanation: {
        what: 'Percentual da força de trabalho desempregada. Publicado mensalmente no Jobs Report (BLS).',
        up:   'Taxa subindo: mercado de trabalho enfraquecendo. Aumentos de 0.5pp em poucos meses → Sahm Rule (recessão à frente).',
        down: 'Mercado aquecido. Abaixo de 4% = perto do pleno emprego (NAIRU estimado em ~4-4.5% para EUA).',
        why:  'É um dos dois mandatos do Fed (junto com inflação). Acompanhado de perto. Cada 0.1pp move mercados.'
      }
    },
    {
      title: 'Nonfarm Payrolls — Monthly Change (K)', type: 'bar', series: ['PAYEMS_MOM'],
      explanation: {
        what: 'Saldo de empregos não-agrícolas criados no mês. Publicado na primeira sexta-feira de cada mês ("Jobs Friday").',
        up:   'Acima de 200K/mês = forte. Acima de 300K/mês = aquecimento. Mercados reagem fortemente.',
        down: 'Abaixo de 100K/mês = preocupante. Negativo = perda líquida de empregos (raro fora de recessões).',
        why:  'É o dado econômico mais movimentado pelos mercados. Determina expectativas de Fed Funds em prazo curto.'
      }
    },
    {
      title: 'LFPR · Total vs Prime Age (%)', type: 'line', series: ['CIVPART', 'LNS11300060'], dualAxis: true,
      explanation: {
        what: 'LFPR = % da população ≥16 anos no mercado de trabalho. Prime Age (25-54) remove efeitos demográficos (envelhecimento).',
        up:   'Pessoas voltando ao mercado de trabalho. Bom sinal. Prime Age subindo é mais relevante (não é demografia).',
        down: 'Pessoas saindo da força de trabalho ("discouraged workers"). Esconde o desemprego real.',
        why:  'LFPR caindo enquanto Unemployment cai não é boa notícia — significa que pessoas desistiram de procurar emprego.'
      }
    },
    {
      title: 'Initial & Continuous Claims (K)', type: 'line', series: ['ICSA_4WK', 'CCSA'], dualAxis: true,
      explanation: {
        what: 'Initial Claims (4-week avg) = novos pedidos de seguro-desemprego. Continuous = pessoas ainda recebendo.',
        up:   'Initial subindo = demissões aumentando. Continuous subindo = desempregados não conseguindo recolocação.',
        down: 'Initial baixo (<250K) = mercado de trabalho saudável. Continuous baixo = desempregados encontrando emprego rapidamente.',
        why:  'Initial Claims é dado SEMANAL — o mais alto frequência indicator do mercado de trabalho. Acima de 350K sustentado tipicamente associado a recessão.'
      }
    },
    {
      title: 'JOLTs Job Openings & JOLTs/Unemployment Ratio', type: 'line',
      series: ['JTSJOL', 'JOLTS_UNEMPLOY_RATIO'], dualAxis: true, refLine: 1,
      explanation: {
        what: 'JOLTs Openings = vagas em aberto. Ratio = vagas / desempregados. >1 = mais vagas que desempregados (mercado apertado).',
        up:   'Ratio > 1.5: mercado MUITO apertado. Pressão salarial e inflação de serviços.',
        down: 'Ratio caindo abaixo de 1: mais desempregados que vagas. Sinal de freada (mas saudável após excesso).',
        why:  'Powell (Fed) cita esse ratio explicitamente nas coletivas. É o melhor termômetro da rigidez do mercado de trabalho.'
      }
    },
    {
      title: 'Hourly Earnings YoY · Wage Growth Tracker (%)', type: 'line',
      series: ['AHETPI_YOY', 'FRBATLWGT3MMAUMHWGO'],
      explanation: {
        what: 'Hourly Earnings = salários médios horários (ponderado, do Jobs Report). Wage Growth Tracker (Atlanta Fed) = mediana, melhor para comparações.',
        up:   'Salários acima de 4% YoY: pressão inflacionária via Serviços. Fed observa para julgar persistência da inflação.',
        down: 'Convergindo para 3-3.5%: compatível com inflação na meta de 2% do Fed.',
        why:  'Salário é o principal canal de transmissão da inflação de Serviços. Fed precisa que isso desinflacione para cortar juros.'
      }
    },
    {
      title: 'RDI · Total vs Ex-Gov Transfers YoY (%)', type: 'line',
      series: ['DSPIC96_YOY', 'W875RX1_YOY'],
      explanation: {
        what: 'RDI = Real Disposable Income. Ex-Gov Transfers remove benefícios sociais (Social Security, food stamps), mostrando renda do trabalho.',
        up:   'Renda real crescendo: poder de compra aumentando. Ex-Gov sustentando crescimento = renda do trabalho forte.',
        down: 'Total subindo enquanto Ex-Gov cai = governo sustentando consumo via transferências (não sustentável).',
        why:  'Renda Ex-Gov é o melhor indicador do consumo "orgânico". Diverge do Total quando há políticas fiscais expansivas.'
      }
    },
  ],

  jobs: [
    {
      title: 'Payrolls by Sector — Monthly Change (K)', type: 'bar', stacked: true,
      series: ['USCONS', 'MANEMP', 'USPBS', 'USEHS', 'USTRADE', 'USLAH', 'USGOVT'],
      explanation: {
        what: 'Decomposição mensal das contratações por setor: Construção, Manufatura, Prof. & Bus. Svcs, Educ. & Saúde, Comércio, Lazer, Governo.',
        up:   'Setores cíclicos (Construção, Manuf, Lazer) puxando: economia em expansão. Educ. & Saúde + Governo = "core jobs" sempre crescem.',
        down: 'Cíclicos caindo enquanto Educ./Saúde resiste = freada precoce. Cíclicos negativos = recessão.',
        why:  'A composição revela o estágio do ciclo. Construção é o primeiro a desaquecer; Governo é o último.'
      }
    },
  ],

  eci: [
    {
      title: 'Employment Cost Index — QoQ (%)', type: 'bar',
      series: ['ECIALLCIV', 'ECIWAG', 'ECIBEN'],
      explanation: {
        what: 'ECI = Custo total de remuneração trimestral (salários + benefícios). Pesquisa BLS, ajustada por composição (não distorce com mix setorial).',
        up:   'ECI > 1% trimestral (anualizado >4%) = pressão salarial. Componente de salários puxa mais. Benefícios estáveis.',
        down: 'Convergindo para 0.6-0.7% trimestral (~2.5-3% anual) = compatível com inflação na meta.',
        why:  'É o indicador de salários PREFERIDO do Fed (mais limpo que Average Hourly Earnings). Sai trimestralmente.'
      }
    },
  ],

  cpi: [
    {
      title: 'CPI & Core-CPI YoY (%)', type: 'line', series: ['CPIAUCSL_YOY', 'CPILFESL_YOY'],
      explanation: {
        what: 'CPI = inflação cheia. Core CPI = exclui alimentos e energia (mais voláteis). YoY = variação anual.',
        up:   'Acima de 3% = preocupante. Acima de 5% = grave. Core teimando alto = inflação difundida.',
        down: 'Convergência para a meta do Fed (2%). Core caindo é mais relevante que CPI cheio (volátil).',
        why:  'CPI é o índice de inflação mais publicado. Core CPI é o que o Fed e mercados realmente acompanham para política monetária.'
      }
    },
    {
      title: 'CPI Components YoY (%)', type: 'line',
      series: ['CUSR0000SAD_YOY', 'CUSR0000SAS_YOY', 'CUSR0000SAH1_YOY'],
      explanation: {
        what: 'Decomposição: Bens Duráveis, Serviços, Shelter (aluguel + owners-equivalent rent, ~33% do CPI).',
        up:   'Bens Duráveis: pressão de cadeia/câmbio. Serviços: salários e demanda doméstica. Shelter: lag de aluguéis.',
        down: 'Bens Duráveis foram primeiros a desinflacionar pós-2022. Shelter desinflaciona com lag (12-18 meses).',
        why:  'Shelter é o componente que o Fed mais espera ver desinflacionando. Tem lag estrutural — anuncia tendência futura.'
      }
    },
    {
      title: 'CPI MoM (%)', type: 'bar', series: ['CPIAUCSL_MOM', 'CPILFESL_MOM'],
      explanation: {
        what: 'Variação mensal do CPI cheio e core. Mais sensível a inflexões que YoY.',
        up:   'MoM > 0.4% (>5% anualizado) = pressão. Core MoM > 0.3% = persistente.',
        down: 'MoM < 0.2% = compatível com meta de 2%. 0.1-0.2% sustentado = desinflação.',
        why:  'Mercado reage muito a CPI MoM no dia da divulgação. Surpresas (vs consensus) movem yields significativamente.'
      }
    },
  ],

  pce: [
    {
      title: 'PCE & Core-PCE YoY (%)', type: 'line', series: ['PCEPI_YOY', 'PCEPILFE_YOY'],
      explanation: {
        what: 'PCE = índice de preços do BEA. Core PCE = exclui alimentos e energia. PESO USADO PELO FED na meta de 2% (não CPI).',
        up:   'Core PCE acima de 3% = Fed segura/aperta. Acima de 4% = aperto agressivo.',
        down: 'Core PCE convergindo para 2-2.5% = Fed pode cortar. É o NÚMERO que define o ciclo de juros.',
        why:  'Fed mira Core PCE = 2%, não CPI. PCE captura mudanças de comportamento do consumidor (substituição), CPI usa cesta fixa.'
      }
    },
    {
      title: 'Core PCE & Trimmed Mean PCE (%)', type: 'line',
      series: ['PCEPILFE_YOY', 'PCETRIM12M159SFRBDAL'],
      explanation: {
        what: 'Trimmed Mean PCE (Dallas Fed) = remove os 16% mais altos e 16% mais baixos. Mostra o "núcleo do núcleo".',
        up:   'Trimmed Mean é o mais "limpo" de outliers. Quando ele sobe, é inflação genuinamente difundida.',
        down: 'Trimmed Mean caindo antes do Core PCE = ótimo sinal de desinflação subjacente.',
        why:  'Dallas Fed publica esse índice como alternativa ao Core PCE para julgar inflação subjacente. Tem menor volatilidade.'
      }
    },
    {
      title: 'PPI YoY (%)', type: 'line', series: ['PPIACO_YOY', 'WPSFD49116_YOY'],
      explanation: {
        what: 'PPI = inflação ao produtor (atacado). All Commodities + Finished Goods. Leading indicator do CPI.',
        up:   'PPI subindo = pressão na cadeia. Antecipa repasse para o varejo (CPI) em 2-4 meses.',
        down: 'PPI caindo (especialmente em commodities) = desinflação à frente.',
        why:  'PPI é leading indicator de CPI. Quando PPI < CPI sustentadamente, margens das empresas se comprimem.'
      }
    },
    {
      title: 'PCE MoM (%)', type: 'bar', series: ['PCEPI_MOM', 'PCEPILFE_MOM'],
      explanation: {
        what: 'PCE e Core PCE mensais. Métrica favorita do Fed em alta frequência.',
        up:   'Core MoM > 0.3% = pressão persistente. Acima de 0.4% por meses = Fed precisa apertar.',
        down: 'Core MoM ≤ 0.2% sustentado = compatível com meta. Fed pode cortar.',
        why:  'Powell cita Core PCE MoM nas coletivas como métrica para decidir Fed Funds. É O número que define corte/manutenção.'
      }
    },
  ],

  monetary: [
    {
      title: 'Fed Funds Rate (%)', type: 'line', series: ['FEDFUNDS'],
      explanation: {
        what: 'Taxa básica de juros americana, definida pelo FOMC. Banda de 25pb (ex: 5.25-5.50%).',
        up:   'Aperto monetário: combate inflação, encarece crédito, pressiona ativos de risco. USD se valoriza globalmente.',
        down: 'Estímulo: encoraja crédito, consumo, investimento. Bom para ações e bonds.',
        why:  'É O indicador macro mais importante do mundo (USD é moeda de reserva). Define custo de capital global.'
      }
    },
    {
      title: 'Yield Curve Spreads (pp)', type: 'line', series: ['T10Y2Y', 'T10Y3M'], refLine: 0,
      explanation: {
        what: 'Spread = juros longos (10y) menos curtos (2y ou 3m). Curva normal: positiva. Invertida: negativa.',
        up:   'Curva positivando: bancos voltam a lucrar com maturity transformation. Crescimento esperado.',
        down: 'Inversão histórica antecede recessões em 6-18 meses. 10y-3m é o melhor preditor (NY Fed model).',
        why:  'Curva 10y-3m invertida acertou TODAS as últimas 8 recessões (desde 1968) com 0 falsos positivos.'
      }
    },
    {
      title: '10y TIPS Real Rate (%)', type: 'line', series: ['DFII10'],
      explanation: {
        what: 'Yield real do Treasury indexado à inflação (10 anos). É o juro real ex-ante de mercado.',
        up:   'Real rate alto = política monetária restritiva. Pressiona ativos de duration (ações de growth, real estate).',
        down: 'Real rate caindo = mais expansionista. Bom para ações, ouro, ativos de longa duração.',
        why:  'É a métrica "verdadeira" da política monetária. Fed mira influenciar real rates via Fed Funds + comunicação.'
      }
    },
    {
      title: 'M2 YoY (%)', type: 'bar', series: ['M2SL_YOY'],
      explanation: {
        what: 'Crescimento anual do agregado monetário M2 (papel-moeda + depósitos + money market).',
        up:   'Liquidez expandindo. Pode pressionar inflação e ativos.',
        down: 'Contração rara historicamente — aconteceu em 2022-2023 pela primeira vez desde 1930s. Sinal de aperto severo.',
        why:  'Monetaristas acompanham M2 como leading indicator de inflação. Relação ficou mais fraca pós-2008, mas ainda relevante.'
      }
    },
    {
      title: 'Financial Stress (St. Louis FSI & NFCI)', type: 'line',
      series: ['STLFSI4', 'NFCI'], refLine: 0,
      explanation: {
        what: 'Índices de stress financeiro do Fed de St. Louis e Chicago. Compostos de yields, spreads, volatilidade. >0 = stress acima do normal.',
        up:   'Stress aumentando: mercados sob tensão. Antecipa contração de crédito.',
        down: 'Condições financeiras frouxas: bancos emprestando, spreads apertados.',
        why:  'NFCI especificamente é usado pelo Fed em modelos. Picos historicamente coincidem com crises (2008, 2020, 2023).'
      }
    },
  ],

  financial: [
    {
      title: 'Household Net Worth ($M)', type: 'line', series: ['BOGZ1FL192090005Q'],
      explanation: {
        what: 'Patrimônio líquido total das famílias americanas. Inclui ações, imóveis, deposits — menos dívidas.',
        up:   'Riqueza familiar crescendo: efeito riqueza positivo no consumo. Famílias se sentem mais prósperas, gastam mais.',
        down: 'Quedas raras (2008, 2020 brevemente). Quando cai, consumo cai com ~6 meses de lag.',
        why:  'Riqueza familiar afeta diretamente o consumo (~70% do PIB). Wealth effect estimado em ~3-5% (gasto adicional por dólar de riqueza).'
      }
    },
    {
      title: 'Household Credit Card Debt ($B)', type: 'line', series: ['CCLACBW027SBOG'],
      explanation: {
        what: 'Saldo total de dívida em cartão de crédito + revolving plans nos bancos comerciais americanos.',
        up:   'Crescimento forte = consumo financiado por dívida. Pode ser sinal de stress (famílias usando cartão para necessidades).',
        down: 'Famílias quitando dívidas (deleveraging). Geralmente sinal de cautela ou recessão (em recessão o consumo de cartão cai).',
        why:  'Cartão de crédito tem juros >20% nos EUA. Saldos altos comprometendo renda futura. Inadimplência em cartão é leading indicator de stress nas famílias.'
      }
    },
    {
      title: 'Corporate Net Worth ($B)', type: 'line', series: ['TNWMVBSNNCB'],
      explanation: {
        what: 'Patrimônio líquido total das empresas não-financeiras americanas. Reflete principalmente valor de mercado de ativos (ações, imóveis).',
        up:   'Empresas mais ricas = mais capacidade de investimento, M&A, retornos para acionistas.',
        down: 'Quedas refletem quedas em ações + imóveis. Reduzem capacidade de investimento e crédito.',
        why:  'Saúde do setor corporativo é crítica para emprego (empresas privadas empregam ~85% dos trabalhadores americanos).'
      }
    },
  ],

  trade: [
    {
      title: 'Trade Balance — Goods & Services ($M)', type: 'bar', series: ['BOPGSTB'],
      explanation: {
        what: 'Saldo da balança comercial (exportações - importações de bens e serviços). EUA cronicamente deficitário em bens.',
        up:   'Déficit reduzindo: ou exportações subindo, ou importações caindo (geralmente sinal de freada doméstica).',
        down: 'Déficit aumentando: economia importando muito (consumo forte) ou exportações fracas.',
        why:  'EUA financiam déficit comercial via influxo de capital (USD como moeda de reserva). Tensões comerciais (tarifas) afetam diretamente.'
      }
    },
    {
      title: 'Exports & Imports ($M)', type: 'line', series: ['BOPTEXP', 'BOPTIMP'],
      explanation: {
        what: 'Valores absolutos mensais de exportações e importações de bens e serviços.',
        up:   'Ambos crescendo: globalização funcionando, comércio expandindo. Sinal de saúde econômica global.',
        down: 'Quedas significativas em ambos = recessão global (visto em 2008-2009, 2020).',
        why:  'O comércio global é leading indicator do ciclo econômico mundial. Quedas conjuntas e abruptas são alertas sérios.'
      }
    },
  ],

  fiscal: [
    {
      title: 'Federal Surplus/Deficit ($M)', type: 'bar', series: ['MTSDS133FMS'],
      explanation: {
        what: 'Resultado mensal do orçamento federal americano (receitas - gastos). Quase sempre negativo.',
        up:   'Movimento para superávit (raro): ou crescimento forte aumentando arrecadação ou cortes de gastos.',
        down: 'Déficit explodindo: gastos pandêmicos (2020-21), guerras, recessões (perda de receita).',
        why:  'EUA rodam déficit estrutural de 5-7% do PIB. Acima disso compromete sustentabilidade. Mercado de Treasuries começa a precificar prêmio.'
      }
    },
    {
      title: 'Federal Debt/GDP (%)', type: 'line', series: ['GFDEGDQ188S'],
      explanation: {
        what: 'Dívida pública total dos EUA como percentual do PIB. Trajetória ascendente desde 1980.',
        up:   'Dívida crescendo mais rápido que PIB. Sustentabilidade fiscal sob pressão.',
        down: 'Crescimento econômico forte ou ajuste fiscal estabilizando a relação. Raro nos últimos 40 anos.',
        why:  'EUA hoje em ~120% Debt/GDP. Sem reforma fiscal, trajetória é insustentável. Risco de crise de dívida ou inflação alta.'
      }
    },
    {
      title: 'Total Public Debt ($T)', type: 'line', series: ['GFDEBTN'],
      explanation: {
        what: 'Estoque nominal da dívida pública americana, em trilhões de USD.',
        up:   'Crescendo a cada déficit + roll-over de juros. Acelerou drasticamente pós-2008 e 2020.',
        down: 'Estabilização ou queda só ocorreria com superávit primário sustentado (não acontece desde anos 90).',
        why:  'O número absoluto importa para credibilidade. Servir dívida custa cada vez mais — juros vão consumindo crescente parcela do orçamento.'
      }
    },
  ],

  markets: [
    {
      title: 'S&P 500', type: 'line', series: ['SP500'],
      explanation: {
        what: 'Índice das 500 maiores empresas americanas listadas em bolsa. Benchmark global de ações.',
        up:   'Mercado em alta: confiança em lucros futuros e/ou expansão de múltiplos. Wealth effect positivo no consumo.',
        down: 'Quedas significativas (>20%) caracterizam bear markets. Frequentemente antecedem ou coincidem com recessões.',
        why:  'É o ativo financeiro mais acompanhado do mundo. ~50% do market cap global em ações. Movimentos afetam confiança global.'
      }
    },
    {
      title: 'VIX (Volatility Index)', type: 'line', series: ['VIXCLS'],
      explanation: {
        what: 'Volatilidade implícita das opções do S&P 500 para 30 dias. Conhecido como "índice do medo".',
        up:   'Picos em momentos de stress: VIX > 30 = nervosismo. > 40 = pânico (visto em 2008, 2020).',
        down: 'VIX < 15 = complacência. Calmaria pode preceder choques.',
        why:  'É o indicador de risk-off mais usado globalmente. Spike no VIX coincide com selloffs em risk assets.'
      }
    },
    {
      title: 'HY Credit Spread (%)', type: 'line', series: ['BAMLH0A0HYM2'],
      explanation: {
        what: 'Spread entre yields de bonds High Yield (junk) e Treasuries equivalentes. Mede prêmio de risco corporativo.',
        up:   'Spread alargando: investidores exigindo mais retorno por risco. Antecipa stress no mercado de crédito.',
        down: 'Spreads apertados (<3%): mercado de crédito relaxado, empresas conseguindo financiamento barato.',
        why:  'É um dos melhores leading indicators de recessão. Spreads >5% historicamente associados a recessões em 6-12 meses.'
      }
    },
    {
      title: '10y Treasury Yield (%)', type: 'line', series: ['DGS10'],
      explanation: {
        what: 'Yield do título do Tesouro americano de 10 anos. Benchmark global de juros longos.',
        up:   'Sobe quando: Fed apertando, inflação esperada subindo, ou Treasury vendido por concerns fiscais.',
        down: 'Cai quando: flight to quality (medo), desinflação, expectativa de cortes do Fed.',
        why:  'É a base de precificação de quase todos os ativos globais. Move hipotecas, valuations de ações, câmbio. Cada 25pb tem impacto sistêmico.'
      }
    },
  ],

  recession: [
    {
      title: 'Recession Probability (%)', type: 'line', series: ['RECPROUSM156N'],
      explanation: {
        what: 'Modelo de probabilidade de recessão a 12 meses, baseado no spread 10y-3m da curva de juros (NY Fed).',
        up:   'Acima de 30% = sinal claro de risco. Acima de 50% = recessão quase certa em 12 meses.',
        down: 'Probabilidade caindo após pico = recessão pode ser evitada (raro).',
        why:  'É um dos modelos de recessão mais respeitados. Acertou TODAS as recessões desde 1968 quando ultrapassou 30%.'
      }
    },
    {
      title: 'Unemployment Rate in Recessions', type: 'line', series: ['UNRATE'],
      explanation: {
        what: 'Taxa de desemprego com áreas sombreadas (em versões avançadas) marcando recessões NBER.',
        up:   'Em recessões, taxa sobe rápido (3-5pp em 12-24 meses). Recuperação leva anos.',
        down: 'Quedas em períodos de expansão. EUA tipicamente atinge ~3.5-4% no auge dos ciclos.',
        why:  'Padrão histórico: desemprego sobe rápido em recessão, cai devagar em expansão. "Up the elevator, down the stairs."'
      }
    },
  ],
};

const BRAZIL_CHARTS = {
  atividade: [
    {
      title: 'Produção Industrial · Varejo · Comércio Ampliado YoY (%)',
      type: 'line', series: ['28503_YOY', '28473_YOY', '28485_YOY'],
      explanation: {
        what: 'Variação anual da produção industrial (IBGE), vendas no varejo restrito e comércio varejista ampliado (inclui veículos e materiais de construção).',
        up:   'Economia em expansão: indústria produzindo, consumidor gastando, setores cíclicos aquecidos.',
        down: 'Atividade desacelerando ou contraindo. Confirma freada no consumo e na produção.',
        why:  'São os 3 indicadores mensais de alta frequência mais acompanhados pelo mercado. Antecipam o PIB (que é trimestral) em ~2-3 meses.'
      }
    },
    {
      title: 'Volume de Serviços YoY (%)',
      type: 'line', series: ['23982_YOY', '21637_YOY'],
      explanation: {
        what: 'Volume = quantidade real de serviços prestados (deflacionada). Nominal = receita em reais correntes (sobe com preços + volume).',
        up:   'Setor de serviços (~65% do PIB) crescendo. Quando volume cresce mais que nominal: deflação. Inverso: inflação no setor.',
        down: 'Serviços contraindo: sinal forte de recessão (setor é menos volátil que indústria/varejo).',
        why:  'Serviços é o maior setor do PIB. Recessão "verdadeira" tipicamente exige queda em serviços, não só em indústria.'
      }
    },
    {
      title: 'IBC-Br vs IBC-Br Ex-Agro YoY (%)',
      type: 'line', series: ['24364_YOY', '29608_YOY'],
      explanation: {
        what: 'IBC-Br = "PIB mensal" do BCB (proxy de alta frequência). Ex-Agro remove o efeito da agropecuária (volátil pelas safras).',
        up:   'Atividade econômica ampla acelerando. Quando os dois sobem juntos: crescimento difundido.',
        down: 'IBC caindo enquanto Ex-Agro sobe: queda devida só à safra (menos preocupante). Ambos caindo: contração econômica real.',
        why:  'É o melhor proxy mensal do PIB disponível. O Ex-Agro filtra ruído da safra para revelar a tendência subjacente.'
      }
    },
    {
      title: 'Confiança do Consumidor (FGV)',
      type: 'line', series: [4393, 4394, 4395],
      explanation: {
        what: 'Índice de confiança = Cond. Atuais (situação presente) + Expectativas Futuras (próximos 6 meses). Base 100.',
        up:   'Consumidor otimista → tende a gastar mais, financiar bens duráveis (carros, eletrodomésticos), investir em imóveis.',
        down: 'Consumidor pessimista → poupa, adia compras, evita dívida. Antecipa freada no varejo em 1-2 trimestres.',
        why:  'Confiança é leading indicator do consumo. Consumo é ~65% do PIB. Quedas abruptas (>10pts em 3 meses) historicamente antecedem recessões.'
      }
    },
    {
      title: 'IBC-Br MoM (%)',
      type: 'bar', series: ['24364_MOM'],
      explanation: {
        what: 'Variação mensal do IBC-Br (PIB mensal do BCB). Capta inflexões de curto prazo na atividade.',
        up:   'Aceleração mensal positiva: economia ganhando momentum. Sequência de altas = expansão sustentada.',
        down: 'Quedas mensais: sinal precoce de freada. 2 quedas seguidas = sinal de alerta.',
        why:  'O MoM detecta mudanças de regime mais rápido que YoY. É o que economistas observam para "nowcast" do PIB trimestral.'
      }
    },
    {
      title: 'Produção Industrial MoM (%)',
      type: 'bar', series: ['28503_MOM'],
      explanation: {
        what: 'Variação mensal da produção física industrial dessazonalizada (IBGE/PIM-PF).',
        up:   'Indústria reagindo: demanda firme, estoques controlados, exportações ajudando.',
        down: 'Quedas refletem freada de demanda doméstica, queda de exportações ou choques de oferta (greves, energia).',
        why:  'Indústria é cíclica e reage rápido a juros e câmbio. PIM-PF é divulgado mensalmente com defasagem curta — ótimo high-frequency.'
      }
    },
    {
      title: 'Vendas no Varejo MoM (%)',
      type: 'bar', series: ['28473_MOM'],
      explanation: {
        what: 'Variação mensal do volume de vendas no varejo restrito (PMC, IBGE). Exclui veículos e construção (que estão no Comércio Ampliado).',
        up:   'Consumidor gastando: confiança alta, renda crescendo, ou estímulo fiscal/crédito.',
        down: 'Queda de consumo: pode refletir inflação corroendo renda, juros altos, ou perda de confiança.',
        why:  'Varejo é o termômetro mais direto do consumo das famílias. Tem peso elevado no PIB e antecipa serviços.'
      }
    },
  ],
  pib: [
    {
      title: 'PIB YoY (%)', type: 'bar', series: ['22109_YOY'],
      explanation: {
        what: 'Variação anual do PIB a preços de mercado (volume real, deflacionado).',
        up:   'Economia em expansão. Acima de 2-2.5% é considerado acima do potencial brasileiro.',
        down: 'PIB negativo por 2 trimestres = recessão técnica. Crescimento abaixo de 1% sinaliza estagnação.',
        why:  'É o resumo final de toda a atividade econômica. Define se o país está crescendo, estagnado ou em recessão.'
      }
    },
    {
      title: 'Componentes do PIB YoY (%) — Demanda', type: 'line',
      series: ['22110_YOY', '22111_YOY', '22113_YOY'],
      explanation: {
        what: 'Decomposição do PIB pela ótica da demanda: Consumo das Famílias, Gastos do Governo, e FBKF (Investimento).',
        up:   'Investimento puxando: crescimento sustentável. Consumo puxando: depende de quão alavancado está. Governo puxando: geralmente fiscal expansionista.',
        down: 'Investimento caindo é o pior sinal — antecipa crescimento futuro fraco. Consumo caindo: famílias retraindo.',
        why:  'A composição revela a qualidade do crescimento. Crescimento via investimento é mais sustentável que via consumo alavancado ou gasto público.'
      }
    },
    {
      title: 'Componentes do PIB YoY (%) — Oferta', type: 'line',
      series: ['22105_YOY', '22106_YOY', '22107_YOY'],
      explanation: {
        what: 'Decomposição pela ótica da produção: Agropecuária, Indústria, Serviços.',
        up:   'Indústria forte = sinal positivo (setor mais cíclico). Serviços forte = motor doméstico. Agro forte = exportações e renda rural.',
        down: 'Indústria caindo é leading indicator de recessão. Serviços resistentes mesmo com indústria fraca = recessão "soft".',
        why:  'Cada setor responde a estímulos diferentes. Indústria → juros e câmbio. Serviços → mercado de trabalho. Agro → safra e commodities.'
      }
    },
    {
      title: 'Exportações & Importações YoY (%)', type: 'line',
      series: ['22114_YOY', '22115_YOY'],
      explanation: {
        what: 'Crescimento real das exportações e importações de bens e serviços (volume).',
        up:   'Exportações subindo = competitividade externa, demanda global. Importações subindo = demanda doméstica forte (especialmente bens de capital).',
        down: 'Importações caindo enquanto exportações sobem = "saudável" (saldo positivo). Ambas caindo = freada generalizada.',
        why:  'Setor externo é canal direto da economia global na economia doméstica. Importações de bens de capital antecipam investimento.'
      }
    },
    {
      title: 'PIB VAB vs PIB Preços de Mercado YoY (%)', type: 'line',
      series: ['22108_YOY', '22109_YOY'],
      explanation: {
        what: 'VAB (Valor Adicionado a Preços Básicos) = soma da produção sem impostos líquidos. Preços de Mercado = inclui impostos e subsídios.',
        up:   'Os dois subindo juntos: economia crescendo organicamente.',
        down: 'Quando PIB Preços de Mercado cresce mais que VAB: governo aumentando impostos. Diferença que cresce = peso fiscal subindo.',
        why:  'A divergência entre VAB e Preços de Mercado é leading indicator de pressão fiscal. Alta tributação distorce o crescimento.'
      }
    },
  ],
  inflacao: [
    {
      title: 'IPCA YoY · Núcleo YoY (%)',
      type: 'line', series: [13522, 'NUCLEO_YOY'],
      explanation: {
        what: 'IPCA = inflação cheia oficial (IBGE). Núcleo = média dos 5 núcleos do BCB (exclui itens voláteis como alimentos in natura e combustíveis).',
        up:   'IPCA acima da meta (3% ± 1,5% atualmente): pressão inflacionária. Se núcleo também sobe: inflação difundida e persistente.',
        down: 'Convergência para a meta. Núcleo caindo é o que mais importa para o BCB cortar Selic.',
        why:  'BCB persegue a meta via Núcleo, não IPCA cheio (volátil). Núcleo persistente acima da meta força ciclo de aperto monetário (Selic alta).'
      }
    },
    {
      title: 'IPCA MoM · Decomposição Núcleos (%)',
      type: 'line', series: [433, 4466, 11427, 16122, 27839, 28750],
      explanation: {
        what: 'Decomposição mensal: IPCA cheio + 5 metodologias de núcleo (MS=médias suavizadas, EX0/EX3=exclusão, DP=duplo peso, P55=percentil 55).',
        up:   'Quando todos os núcleos estão altos: pressão inflacionária generalizada. BCB precisa apertar.',
        down: 'Convergência dos núcleos para baixo: BCB pode flexibilizar política monetária.',
        why:  'Múltiplos núcleos em movimento concordante reduzem ruído. Divergências sinalizam choques específicos vs inflação estrutural.'
      }
    },
    {
      title: 'IPCA Bens vs Serviços MoM (%)',
      type: 'line', series: [10843, 10844],
      explanation: {
        what: 'Decomposição do IPCA em Bens (industriais, alimentos, eletrônicos) vs Serviços (aluguel, educação, saúde, alimentação fora).',
        up:   'Bens sobem com câmbio fraco e cadeias de suprimento. Serviços sobem com mercado de trabalho aquecido (demanda doméstica).',
        down: 'Quando ambos cedem: desinflação real. Serviços teimam mais (salário rígido para baixo).',
        why:  'Inflação de Serviços é a mais persistente e a que mais preocupa o BCB. Ela só cai quando o mercado de trabalho desaquece.'
      }
    },
    {
      title: 'Núcleo · 3M & 6M Anualizados (%)',
      type: 'line', series: ['NUCLEO_3M_A', 'NUCLEO_6M_A'],
      explanation: {
        what: 'Inflação anualizada via composição: a média do núcleo dos últimos 3 (ou 6) meses, projetada para um ano. Mostra a tendência recente da inflação.',
        up:   'Aceleração: a inflação está rodando acima da tendência de 12 meses. Sinal precoce de re-aceleração.',
        down: 'Desaceleração: tendência mais favorável. BCB observa esse indicador antes do YoY (mais lento).',
        why:  'O 3M/6M anualizado capta inflexões antes do YoY. Se o 3M está abaixo do YoY, a inflação está caindo. É o número que o BCB cita nas atas para justificar cortes ou pausas.'
      }
    },
    {
      title: 'IPCA Serviços · 3M & 6M Anualizados (%)',
      type: 'line', series: ['10844_3M_A', '10844_6M_A'],
      explanation: {
        what: 'O mesmo conceito de anualização aplicado especificamente aos Serviços do IPCA.',
        up:   'Serviços acelerando: pressão difícil de combater (depende do mercado de trabalho). BCB fica mais hawkish.',
        down: 'Serviços desinflacionando: condição necessária para BCB cortar Selic.',
        why:  'É o indicador mais observado pelo BCB para definir o ciclo de juros. Serviços anualizado > 5% historicamente associado a Selic mantida ou subindo.'
      }
    },
    {
      title: 'Índice de Difusão (%)',
      type: 'line', series: [21379],
      explanation: {
        what: 'Percentual dos itens do IPCA que tiveram alta de preços no mês. Acima de 50% = mais itens subindo do que caindo.',
        up:   'Inflação se espalhando para mais itens da cesta. Sinal de pressão generalizada (não localizada).',
        down: 'Pressão concentrada em poucos itens. Inflação tende a ser mais transitória.',
        why:  'Difusão alta + núcleo alto = inflação estrutural. Difusão baixa mesmo com IPCA alto = choques específicos (combustível, energia).'
      }
    },
    {
      title: 'IGP-M MoM · YoY (%)',
      type: 'line', series: [189, '189_YOY'], dualAxis: true,
      explanation: {
        what: 'IGP-M (FGV) = inflação do atacado + construção + IPC. É o indicador usado para reajuste de aluguéis.',
        up:   'Pressão no atacado (commodities, câmbio). Antecipa repasse para o varejo (IPCA) em 2-4 meses.',
        down: 'Atacado deflacionando: alívio à frente para o IPCA.',
        why:  'IGP-M é leading indicator do IPCA. Também impacta diretamente milhões de contratos de aluguel atrelados.'
      }
    },
    {
      title: 'IPCA Grupos MoM (%)',
      type: 'line', series: [1635, 1636, 1639, 1641, 1643],
      explanation: {
        what: 'Variação mensal de 5 grupos principais do IPCA: Alimentação, Habitação, Transportes, Saúde, Educação.',
        up:   'Alimentação volátil (clima/safra). Habitação inclui aluguel e energia. Transportes incluem combustíveis. Saúde e Educação são tipicamente mais resistentes.',
        down: 'Diferentes grupos refletem diferentes choques. Alimentos caindo no início do ano é típico (entressafra inversa).',
        why:  'A composição revela QUEM está pressionando a inflação cheia. Um IPCA alto puxado só por transportes (combustível) é diferente de um IPCA alto puxado por serviços (saúde).'
      }
    },
    {
      title: 'IC-Br YoY (%)',
      type: 'line', series: ['27574_YOY'],
      explanation: {
        what: 'Índice de Commodities Brasil (BCB): cesta de commodities ponderada pela importância para a economia brasileira.',
        up:   'Commodities subindo → bom para exportadores e termos de troca. Mas pressiona inflação (alimentos, energia).',
        down: 'Commodities caindo → alívio inflacionário, mas pressiona PIB e câmbio (menos divisas entrando).',
        why:  'Brasil é grande exportador de commodities. IC-Br é leading indicator de balança comercial e parte da inflação (alimentos, energia).'
      }
    },
    {
      title: 'IGP-M YoY vs IPCA YoY (%)',
      type: 'line', series: [13522, '189_YOY'],
      explanation: {
        what: 'Comparativo entre o IPCA (varejo, oficial do BCB) e o IGP-M (atacado + construção + IPC, FGV). IGP-M é mais volátil e leading.',
        up:   'IGP-M subindo antes do IPCA: pressão de preços no atacado/commodities. Repasse para o varejo costuma vir em 2-4 meses.',
        down: 'IGP-M caindo enquanto IPCA persiste: choques de commodities normalizando, alívio à frente para o IPCA.',
        why:  'IGP-M é leading indicator do IPCA via preços de produtor. Também é o índice mais usado em contratos de aluguel (impacto direto no IPCA-Habitação).'
      }
    },
    {
      title: 'IC-Br Índice (nível)',
      type: 'line', series: [27574],
      explanation: {
        what: 'Nível do Índice de Commodities Brasil (BCB) — não a variação, mas a pontuação histórica do índice.',
        up:   'Nível alto: commodities em ciclo de alta. Geralmente associado a câmbio apreciado e termos de troca favoráveis.',
        down: 'Nível baixo: ciclo de baixa de commodities. Pressão sobre balança comercial e câmbio.',
        why:  'O nível absoluto contextualiza o YoY. Um YoY positivo partindo de nível baixo pós-correção é diferente de YoY positivo no topo do ciclo.'
      }
    },
  ],
  trabalho: [
    {
      title: 'Taxa de Desemprego (%)', type: 'line', series: [24369],
      explanation: {
        what: 'Percentual da força de trabalho desempregada (PNAD Contínua, IBGE). Mensal, com defasagem de ~2 meses.',
        up:   'Mais pessoas sem trabalho. Sinal de freada. Acima de 10% historicamente associado a recessão.',
        down: 'Mercado aquecido. Abaixo de 7-8% no Brasil é "pleno emprego" estrutural.',
        why:  'Mercado de trabalho é um dos 3 mandatos do BCB. Desemprego baixo pressiona inflação de Serviços via salários.'
      }
    },
    {
      title: 'CAGED · Contratações Líquidas (K)', type: 'bar', series: ['28763_MOM'],
      explanation: {
        what: 'Saldo mensal de contratações - demissões no mercado formal (Ministério do Trabalho).',
        up:   'Saldo positivo: economia gerando empregos formais. Acima de 200K/mês é forte.',
        down: 'Saldo negativo: demissões superando contratações. Sinal de stress (pode ser sazonal — dezembro tem viés negativo).',
        why:  'É o indicador de mercado de trabalho mais rápido (publicado ~30 dias após o mês de referência). Antecipa Taxa de Desemprego e renda.'
      }
    },
    {
      title: 'CAGED 3M Avg (K)', type: 'line', series: ['28763_3M'],
      explanation: {
        what: 'Média móvel de 3 meses do CAGED. Suaviza ruído mensal e sazonalidade.',
        up:   'Tendência de criação de emprego acelerando: economia em expansão sustentada.',
        down: 'Tendência caindo: enfraquecimento estrutural do mercado de trabalho.',
        why:  'A média móvel é o que o BCB e analistas usam para julgar a tendência real. Mês a mês tem muito ruído.'
      }
    },
    {
      title: 'Renda Real YoY (%)', type: 'line',
      series: ['24382_YOY', '24385_YOY'],
      explanation: {
        what: 'Variação anual da renda média real (descontada inflação) dos trabalhadores com carteira e do setor privado.',
        up:   'Salários crescendo acima da inflação: ganho de poder de compra. Bom para consumo, mas pressiona inflação de Serviços.',
        down: 'Renda real caindo: poder de compra erodindo. Consumidor retrai compras discricionárias.',
        why:  'Renda real é o principal driver do consumo. Também é o vetor pelo qual o mercado de trabalho transmite inflação para os preços.'
      }
    },
    {
      title: 'Pessoas Ocupadas YoY (%)', type: 'line', series: ['24379_YOY'],
      explanation: {
        what: 'Crescimento anual do número total de pessoas trabalhando (formal + informal).',
        up:   'Mais gente trabalhando: mais renda agregada, mais consumo.',
        down: 'Contração no emprego: queda de renda agregada, freada no consumo. Recessão típica.',
        why:  'Junto com renda real, define a massa salarial total. Massa salarial é o melhor preditor de consumo de famílias.'
      }
    },
  ],
  fiscal: [
    {
      title: 'Dívida Bruta & Líquida/PIB (%)', type: 'line', series: [13762, 4513],
      explanation: {
        what: 'Bruta = todos os passivos do governo. Líquida = bruta menos ativos (reservas, créditos a receber). Em % do PIB.',
        up:   'Trajetória ascendente: governo gastando mais que arrecada. Mercado começa a precificar risco fiscal (juros longos sobem).',
        down: 'Trajetória declinante: superávit primário ou crescimento econômico forte (denominador).',
        why:  'É o termômetro de sustentabilidade fiscal. Brasil hoje tem ~76-80% Bruta — alto para emergente. Países com >100% costumam ter crises de confiança.'
      }
    },
    {
      title: 'Resultado Primário/PIB (%)', type: 'bar', series: [5793],
      explanation: {
        what: 'Receitas - Despesas do governo (excluindo juros), em % do PIB. Mensal acumulado em 12 meses.',
        up:   'Movimento para superávit (positivo): governo arrumando as contas. Mercado precifica menos risco fiscal.',
        down: 'Déficit primário aumentando: governo gastando muito além da arrecadação. Pressiona dívida e inflação.',
        why:  'Primário positivo é necessário para estabilizar a dívida no longo prazo. Brasil teve déficit primário entre 2014-2022; voltar ao superávit é prioridade fiscal.'
      }
    },
    {
      title: 'Resultado Nominal/PIB (%)', type: 'line', series: [5727],
      explanation: {
        what: 'Resultado primário - juros nominais. Em % do PIB.',
        up:   'Movimento para zero ou positivo: dívida estabilizando.',
        down: 'Déficit nominal alto: dívida crescendo automaticamente. Brasil rodando -8% a -10% nos últimos anos.',
        why:  'É o número final que define se a dívida sobe ou não. Mesmo com superávit primário, se os juros forem altos, o nominal é negativo e a dívida cresce.'
      }
    },
    {
      title: 'Dívida Bruta YoY (%)', type: 'bar', series: ['13761_YOY'],
      explanation: {
        what: 'Variação anual do estoque nominal de dívida bruta (em reais).',
        up:   'Acima da inflação + crescimento real do PIB: dívida/PIB sobe. Acima de ~10% é preocupante.',
        down: 'Crescimento abaixo do PIB nominal: dívida/PIB cai (situação favorável).',
        why:  'Mostra a dinâmica da dívida em valores absolutos. Quando o YoY da dívida ultrapassa o YoY do PIB nominal, a relação dívida/PIB sobe.'
      }
    },
    {
      title: 'Resultado Consolidado das Estatais (R$ M, anual)',
      type: 'bar', series: ['RESULT_ESTATAIS'],
      explanation: {
        what: 'Soma anual do resultado primário das empresas estatais Federais (2150) + Estaduais (2151) + Municipais (2152). Cada barra representa um ano calendário fechado (jan-dez).',
        up:   'Estatais gerando superávit: contribuem positivamente para o resultado primário do governo. Boa gestão e/ou tarifas em alta.',
        down: 'Estatais deficitárias: drenam o resultado primário, exigindo aportes do Tesouro. Sinaliza ineficiência ou subsídios cruzados.',
        why:  'O setor estatal é monitorado pelo BCB no cálculo do "setor público consolidado". Resultado negativo persistente das estatais agrava a situação fiscal do país. A visão anual remove ruído sazonal e revela a tendência fiscal das estatais.'
      }
    },
    {
      title: 'Resultado Nominal/PIB vs Taxa de Desemprego',
      type: 'line', series: [5727, 24369], dualAxis: true,
      explanation: {
        what: 'Comparativo entre o resultado nominal fiscal (% PIB) e a taxa de desemprego. Eixos duais — fiscal à esquerda (negativo), desemprego à direita.',
        up:   'Desemprego subindo + resultado nominal piorando: estabilizadores automáticos atuando (mais gastos com seguro-desemprego, menos arrecadação). Deteriorização gêmea.',
        down: 'Desemprego caindo + resultado nominal melhorando: ciclo virtuoso (mais arrecadação, menos transferências). Relação típica de ciclo expansionista.',
        why:  'Mostra a relação entre o ciclo econômico e a saúde fiscal. Em recessões, os dois pioram juntos. Em recuperações, os dois melhoram. É o contrário de "austeridade pró-cíclica".'
      }
    },
  ],
  credito: [
    {
      title: 'Saldo de Crédito Total YoY (%)',
      type: 'line', series: ['20539_YOY'],
      explanation: {
        what: 'Variação anual do saldo total de crédito do sistema financeiro nacional (PJ + PF, todas as modalidades).',
        up:   'Aceleração do crédito → famílias e empresas tomando mais empréstimos. Sinal de expansão do consumo e investimento.',
        down: 'Desaceleração ou contração → aperto monetário fazendo efeito, demanda fraca, ou risco aumentando. Pode antecipar recessão.',
        why:  'É um dos termômetros mais diretos do impacto da política monetária na economia real. Crédito travando significa investimento e consumo travando.'
      }
    },
    {
      title: 'Crédito PJ vs PF YoY (%)',
      type: 'line', series: ['20540_YOY', '20541_YOY'],
      explanation: {
        what: 'Comparativo do crescimento anual do crédito para Pessoa Jurídica (empresas) vs Pessoa Física (famílias).',
        up:   'Quando PJ acelera mais que PF: investimento empresarial forte. Quando PF acelera mais: consumo com alavancagem.',
        down: 'Quedas em PJ sinalizam empresas evitando dívida (cautela com economia). Quedas em PF mostram famílias retraindo consumo.',
        why:  'A divergência entre PJ e PF revela onde está o motor (ou o freio) da economia. PJ caindo enquanto PF cresce indica consumo financiado por dívida — um padrão arriscado.'
      }
    },
    {
      title: 'Concessão de Crédito YoY (%)',
      type: 'line', series: ['20631_YOY'],
      explanation: {
        what: 'Volume novo de crédito concedido por mês (fluxo), comparado com o mesmo mês do ano anterior.',
        up:   'Mais empréstimos sendo originados → bancos confiantes, demanda forte por crédito.',
        down: 'Bancos restringindo originação ou tomadores recuando. Antecipa freada na economia em 1-2 trimestres.',
        why:  'Indicador de fluxo (não estoque) é mais sensível que o saldo total. Capta mudanças de regime mais rápido.'
      }
    },
    {
      title: 'Inadimplência Total · PJ · PF (%)',
      type: 'line', series: [21082, 21083, 21084],
      explanation: {
        what: 'Percentual da carteira de crédito em atraso superior a 90 dias, dividido em Total, PJ e PF.',
        up:   'Sinal de stress: famílias e empresas perdendo capacidade de pagamento. Bancos provisionam mais, restringem novo crédito.',
        down: 'Saúde melhorando, devedores conseguindo pagar. Bancos podem expandir crédito.',
        why:  'É o termômetro do risco de crédito. PF tipicamente >PJ no Brasil. Inadimplência crescendo > 4-5% historicamente antecede crises bancárias e recessões.'
      }
    },
    {
      title: 'Inadimplência do Agronegócio (%)',
      type: 'line', series: [21146],
      explanation: {
        what: 'Percentual da carteira de crédito rural/agronegócio em atraso superior a 90 dias.',
        up:   'Stress no setor: pode refletir quebras de safra, queda de preços de commodities, eventos climáticos (seca/geada), juros altos pressionando produtores.',
        down: 'Setor saudável: safras boas, preços favoráveis, balanço dos produtores em ordem.',
        why:  'O agro responde por ~25% do PIB brasileiro. A inadimplência rural antecipa crises no setor que se propagam para máquinas, fertilizantes, bancos regionais e cooperativas. Historicamente fica abaixo dos demais segmentos (1-3%); picos > 5% sinalizam crise séria.'
      }
    },
    {
      title: 'ICC · Endividamento · Comprometimento (%)',
      type: 'line', series: [25351, 29034, 29035],
      explanation: {
        what: 'ICC = Índice de Custo do Crédito (juros médios da economia). Endividamento = dívida das famílias / renda anual. Comprometimento = parcelas mensais / renda mensal.',
        up:   'ICC subindo: crédito mais caro. Endividamento subindo: famílias mais alavancadas. Comprometimento > 30%: famílias vulneráveis a choques.',
        down: 'Movimento contrário: crédito mais barato, alavancagem caindo — espaço para consumir mais.',
        why:  'São os 3 indicadores que medem se o consumidor brasileiro tem espaço para gastar. Quando todos estão altos simultaneamente, varejo e serviços enfraquecem.'
      }
    },
  ],
  agregados: [
    {
      title: 'Selic (%)', type: 'line', series: [4189],
      explanation: {
        what: 'Taxa básica de juros da economia brasileira, definida pelo Copom (BCB) a cada 45 dias.',
        up:   'Aperto monetário: combate inflação, encarece crédito, freia consumo e investimento. Atrai capital externo (câmbio aprecia).',
        down: 'Estímulo: incentiva crédito, consumo, investimento. Pode pressionar inflação se feito muito cedo.',
        why:  'É a principal ferramenta de política monetária. Determina taxa de empréstimos, rendimento de poupança/CDI e atratividade de Brasil para capital externo.'
      }
    },
    {
      title: 'Agregados Monetários YoY (%)', type: 'line',
      series: ['1788_YOY', '27791_YOY', '27810_YOY'],
      explanation: {
        what: 'Crescimento anual dos agregados: Base Monetária (papel-moeda + reservas), M1 (líquido), M2 (incluindo depósitos a prazo).',
        up:   'M2 acelerando: liquidez na economia. Pode pressionar inflação se a velocidade da moeda também subir.',
        down: 'Contração monetária real: BCB efetivamente segurando a liquidez.',
        why:  'Velocidade dos agregados sinaliza força/fraqueza da política monetária. M1 caindo enquanto Base sobe = "pushing on a string" (estímulo não chegando à economia real).'
      }
    },
  ],
  externo: [
    {
      title: 'Transações Correntes/PIB (%)', type: 'line', series: [23079],
      explanation: {
        what: 'Saldo das transações correntes (bens + serviços + rendas) em % do PIB. Mede dependência de capital externo.',
        up:   'Movimento para zero ou positivo: país menos dependente de financiamento externo.',
        down: 'Déficit aumentando: país consumindo mais do que produz. Vulnerabilidade externa.',
        why:  'Brasil rodando déficit de 2-3% é normal e financiável. Acima de 4-5%: risco de crise cambial (sudden stop de capital externo).'
      }
    },
    {
      title: 'Balança de Bens & Serviços ($M)', type: 'bar', series: [22707, 22719],
      explanation: {
        what: 'Saldo da balança comercial de bens (positivo crônico no Brasil) e de serviços (negativo crônico).',
        up:   'Bens: superávit forte = exportação de commodities + manufaturados acima das importações. Serviços: redução do déficit estrutural.',
        down: 'Bens caindo: ou queda de preços de commodities ou queda de volume exportado. Sinal preocupante.',
        why:  'A balança de bens é o pilar da defesa externa do Brasil. Com agro e minério forte, fica em superávit; isso financia o déficit em serviços e remessas.'
      }
    },
    {
      title: 'Exportações vs Importações Bens YoY (%)', type: 'line',
      series: ['22708_YOY', '22709_YOY'],
      explanation: {
        what: 'Crescimento anual de exportações e importações de bens, em valor (USD).',
        up:   'Exp > Imp acelerando: superávit comercial expandindo. Bom para câmbio e PIB.',
        down: 'Imp caindo > Exp = freada doméstica. Exp caindo > Imp = recessão global.',
        why:  'Exp e Imp em crescimento conjunto = ciclo virtuoso. Imp em queda enquanto Exp cresce = freada típica de Brasil em recessão.'
      }
    },
    {
      title: 'IDP · Ingressos vs Saídas ($M)', type: 'line', series: [22886, 22887], dualAxis: true,
      explanation: {
        what: 'Investimento Direto no País (IDP): ingressos brutos (eixo esquerdo) vs saídas (eixo direito). Eixos separados pela diferença de magnitude.',
        up:   'Ingressos crescendo: confiança internacional alta, multinacionais investindo. Bom para câmbio e crescimento.',
        down: 'Ingressos caindo ou saídas crescendo: capital fugindo. Pressão sobre o real.',
        why:  'IDP é o capital "estável" que financia o déficit em conta corrente. Diferente de carteira (volátil), o IDP é difícil de retirar rapidamente.'
      }
    },
    {
      title: 'Reservas Internacionais ($M)', type: 'line', series: [3546],
      explanation: {
        what: 'Estoque de reservas em USD do BCB. Brasil rodando ~360-380 bi USD.',
        up:   'BCB acumulando reservas: defesa contra crises cambiais aumentando.',
        down: 'BCB queimando reservas: defesa do câmbio em momento de stress (raro nos últimos anos).',
        why:  'Reservas amplas (~20% do PIB) são um dos principais pilares de classificação de risco. Brasil tem reservas suficientes para ~24 meses de importações.'
      }
    },
    {
      title: 'IDP/PIB (%)', type: 'line', series: [23080],
      explanation: {
        what: 'Investimento Direto no País como percentual do PIB. Indica dependência de capital externo de longo prazo.',
        up:   'IDP/PIB > Déficit em CC: situação saudável (capital de longo prazo financia o déficit corrente).',
        down: 'IDP/PIB < Déficit em CC: financiamento via capital de curto prazo (volátil). Vulnerabilidade.',
        why:  'A regra de ouro: IDP deve cobrir o déficit em transações correntes para evitar crises cambiais. Brasil tem cumprido essa regra.'
      }
    },
    {
      title: 'Conta Capital ($M)', type: 'bar', series: [22851],
      explanation: {
        what: 'Saldo da Conta Capital do BP: transferências de capital (perdão de dívidas, aquisição/venda de ativos não-produzidos como marcas, patentes).',
        up:   'Geralmente pequeno e positivo no Brasil. Reflete fluxos one-off de transferências internacionais.',
        down: 'Pode ficar negativo em casos pontuais (saída de royalties, venda de propriedade intelectual).',
        why:  'É um componente menor do BP, mas obrigatório para fechamento contábil. Conjugado com Transações Correntes + Conta Financeira, mostra a posição externa completa.'
      }
    },
    {
      title: 'Conta Financeira ($M)', type: 'bar', series: [22863],
      explanation: {
        what: 'Saldo líquido de fluxos financeiros: IDE + Investimento em Carteira + Outros Investimentos + Reservas. Espelho contábil da Conta Corrente + Capital.',
        up:   'Saldo positivo: ingresso líquido de capital externo.',
        down: 'Saldo negativo: saída líquida de capital. Geralmente acompanha déficit em transações correntes (financiamento).',
        why:  'Revela COMO o Brasil financia seu déficit externo: via IDE (estável) ou via carteira (volátil). Composição importa mais que o saldo total.'
      }
    },
    {
      title: 'Investimento Direto no Exterior ($M)', type: 'bar', series: [22865],
      explanation: {
        what: 'Investimento Direto realizado por brasileiros no exterior. Empresas brasileiras comprando empresas/ativos fora do país.',
        up:   'Empresas brasileiras se internacionalizando: sinal de maturidade do setor produtivo. Mas é saída de divisas.',
        down: 'Reflux: empresas brasileiras desinvestindo no exterior, repatriando capital.',
        why:  'Mostra a outra face do IDP. Brasil historicamente recebe muito mais IDE do que envia (IDE/IDE-Exterior > 5x).'
      }
    },
    {
      title: 'Exportações & Importações de Serviços ($M)',
      type: 'line', series: [22720, 22721], dualAxis: true,
      explanation: {
        what: 'Exportações de serviços (eixo esquerdo: turismo recebido, fretes, royalties cobrados) vs Importações (eixo direito: turismo enviado, fretes pagos, royalties pagos). Brasil é deficitário cronicamente.',
        up:   'Exportações subindo: ganhos em competitividade global de serviços (TI, financeiros). Importações subindo = brasileiros viajando + pagando royalties (geralmente acompanha câmbio apreciado).',
        down: 'Importações caindo: câmbio desvalorizado encarece serviços externos, brasileiros viajam menos.',
        why:  'A balança de serviços tem déficit estrutural (~30-40 bi USD/ano). Sensível a câmbio: quando real desvaloriza, importações caem e o déficit diminui.'
      }
    },
    {
      title: 'Transações Correntes/PIB vs Resultado Nominal/PIB (%)',
      type: 'line', series: [23079, 5727], dualAxis: true,
      explanation: {
        what: 'Comparativo dos "déficits gêmeos" em eixos separados: externo (Trans. Correntes/PIB, eixo esquerdo) e fiscal (Resultado Nominal/PIB, eixo direito). Eixos separados porque as escalas têm magnitudes diferentes.',
        up:   'Os dois melhorando juntos: ajuste fiscal reduzindo demanda doméstica → menos importações → déficit externo cai. Cenário de "ortodoxia".',
        down: 'Os dois piorando juntos: expansão fiscal puxando consumo → mais importações + mais dívida pública. Cenário arriscado (vide 2014-2015).',
        why:  'A "Tese dos Déficits Gêmeos" (Twin Deficits): déficits fiscais altos tendem a gerar déficits externos altos. Quando ambos pioram juntos = crise gemelar (Brasil 1999, Argentina 2001).'
      }
    },
  ],
  recessao: [
    {
      title: 'IPCA YoY · Taxa Desemprego (%)', type: 'line',
      series: [13522, 24369], dualAxis: true,
      explanation: {
        what: 'Curva de Phillips brasileira: relação entre inflação (IPCA) e desemprego.',
        up:   'Inflação sobe + desemprego baixo: economia aquecida, BCB precisa apertar. Estagflação se ambos sobem juntos.',
        down: 'Ambos caindo = "soft landing" (desinflação sem recessão). Cenário ideal para o BCB.',
        why:  'A Curva de Phillips é o mapa da política monetária. Decisões do Copom buscam levar a economia para o quadrante "inflação na meta + desemprego no NAIRU".'
      }
    },
    {
      title: 'Dívida Bruta/PIB (%)', type: 'line', series: [13762],
      explanation: {
        what: 'Trajetória de longo prazo da dívida bruta como % do PIB.',
        up:   'Trajetória ascendente: deterioração fiscal. Sinal vermelho para investidores e agências de rating.',
        down: 'Trajetória declinante: ajuste fiscal funcionando ou crescimento econômico forte.',
        why:  'Em recessões, dívida/PIB sobe por dois efeitos: déficit aumenta + PIB cai (denominador). É o indicador-chave para o "regime fiscal".'
      }
    },
    {
      title: 'Selic vs IPCA YoY (%)', type: 'line', series: [4189, 13522],
      explanation: {
        what: 'Comparativo da taxa de juros nominal (Selic) e da inflação (IPCA YoY). A diferença é o juro real ex-post aproximado.',
        up:   'Selic muito acima da inflação: juro real alto, política monetária restritiva (recessivo).',
        down: 'Selic se aproximando da inflação: política se afrouxando ou inflação acelerando.',
        why:  'Juro real é o que importa para decisões econômicas. Brasil tem rodado juro real de 5-8% — entre os mais altos do mundo.'
      }
    },
  ],
};
