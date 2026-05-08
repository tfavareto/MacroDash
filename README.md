# 📊 MacroDash

> Terminal de pesquisa macroeconômica para Brasil 🇧🇷 e USA 🇺🇸 — dashboard estilo Bloomberg para acompanhar 300+ indicadores em tempo real.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stack](https://img.shields.io/badge/stack-vanilla%20JS-yellow)
![Data](https://img.shields.io/badge/data-FRED%20%2B%20BACEN-orange)

---

## ✨ Features

- **150+ séries USA** via [FRED API](https://fred.stlouisfed.org/) — Federal Reserve Bank of St. Louis
- **150+ séries Brasil** via [BACEN SGS](https://www3.bcb.gov.br/sgspub/) — Banco Central do Brasil
- **Heatmap em escala RdYlGn 11 níveis** (-5 vermelho → 0 amarelo → +5 verde)
- **100+ gráficos** organizados por categoria (Atividade, Inflação, Trabalho, Crédito, Fiscal, Setor Externo, etc.)
- **Cada gráfico tem botão "?" com explicação contextual**: o que mostra, o que significa quando sobe/cai, por que acompanhar
- **Visualização dual**: Gráficos × Tabelas com histórico mensal
- **Cálculos derivados**: YoY, MoM, 3M Anualizado, 6M Anualizado, Núcleos compostos, sums anuais
- **TradingView widgets** para Índices B3 (IBOV, SMLL, IBrX, IFIX, IDIV, IBHB) em tempo real
- **Entrada manual de ISM PMI** com upload de planilha Excel/CSV (ISM bloqueia scraping com reCAPTCHA)
- **Tema preto + laranja** com tipografia Playfair Display nos títulos

---

## 📸 Screenshots

> Adicionar screenshots aqui após primeiro deploy

---

## 🚀 Quick Start

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/macrodash.git
cd macrodash/dashboard
```

### 2. Configure sua FRED API key
1. Crie uma conta gratuita em [fred.stlouisfed.org](https://fred.stlouisfed.org/) e gere uma API key
2. Copie o template:
   ```bash
   cp js/secrets.example.js js/secrets.local.js
   ```
3. Abra `js/secrets.local.js` e cole sua key:
   ```js
   window.SECRETS = {
     FRED_API_KEY: 'sua_chave_aqui',
   };
   ```

### 3. Rode um servidor estático local
Qualquer servidor HTTP serve. Algumas opções:

```bash
# Opção A — Node.js
npx serve -l 5173

# Opção B — Python
python -m http.server 5173

# Opção C — VSCode
# Instale "Live Server" e clique em "Go Live" no rodapé
```

### 4. Abra no navegador
```
http://localhost:5173
```

---

## 🗂️ Estrutura

```
dashboard/
├── index.html              # Estrutura principal
├── css/
│   └── style.css          # Tema preto + laranja
├── js/
│   ├── config.js          # Definições de séries, charts, heatmap
│   ├── api.js             # Fetcher FRED + BACEN com cache
│   ├── charts.js          # Renderer Chart.js
│   ├── heatmap.js         # Renderer do heatmap (escala RdYlGn 11 níveis)
│   ├── app.js             # Lógica principal, navegação, KPIs
│   ├── tradingview.js     # Widgets TradingView para B3
│   ├── ism-manual.js      # Entrada manual ISM PMI
│   ├── secrets.example.js # Template (sem chave)
│   └── secrets.local.js   # Sua chave FRED (NÃO commitar!)
└── .gitignore
```

---

## 🧠 Arquitetura

### Fluxo de Dados
```
Browser ─┬─→ FRED API (USA, via CORS proxy)
         └─→ BACEN SGS API (Brasil, CORS direto)
                   ↓
             api.js (cache 1h)
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
- **Vanilla JS** — sem framework, sem build step. Edite, atualize a página, pronto.
- **Chart.js 4** + plugins (annotation, time adapter)
- **Inter** + **Playfair Display** + **Roboto** (Google Fonts)
- **Cache em memória** com TTL de 1h nas chamadas de API

### Indicadores
Configurados em `config.js` como objetos:
```js
const BACEN_SERIES = {
  13522: {
    name: 'IPCA YoY',
    unit: '%',
    tab: 'inflacao',
    dir: -1,             // -1 = menor é melhor
    lo: 0, hi: 12        // thresholds para o heatmap
  },
  ...
};
```

Cada gráfico tem definição completa com **explicação contextual**:
```js
{
  title: 'IPCA YoY · Núcleo YoY (%)',
  type: 'line',
  series: [13522, 'NUCLEO_YOY'],
  explanation: {
    what: 'IPCA = inflação cheia oficial...',
    up:   'IPCA acima da meta...',
    down: 'Convergência para a meta...',
    why:  'BCB persegue a meta via Núcleo, não IPCA cheio...'
  }
}
```

---

## 🔌 Fontes de Dados

### 🇺🇸 USA — FRED (Federal Reserve)
- **Base URL:** `https://api.stlouisfed.org/fred/`
- **Auth:** API key gratuita (necessária)
- **Limite:** 120 requests/min
- **CORS:** ❌ não suporta — usamos `https://corsproxy.io/?` como proxy
- **Cobertura:** Housing, Activity, GDP, Labor, ECI, CPI, PCE+PPI, Monetary Policy, Financial Accounts, Trade, Fiscal, Markets, Recession

### 🇧🇷 Brasil — BACEN SGS
- **Base URL:** `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{id}/dados`
- **Auth:** sem chave necessária
- **CORS:** ✅ suporta nativamente
- **Cobertura:** Atividade, PIB, Inflação, Mercado de Trabalho, Política Fiscal, Crédito, Agregados Monetários, Setor Externo, Recessões

### 📈 B3 — TradingView Widget
- Embeds gratuitos para IBOV, SMLL, IBrX 100, IFIX, IDIV, IBHB

### ⚠️ ISM PMI (Manufacturing/Services)
- ISM bloqueia scraping com Google reCAPTCHA. Solução: **entrada manual** via UI (form + upload XLSX). Cadastre os números headline mensalmente em ~10 minutos.

---

## 🎨 Heatmap — Escala de Cores

Escala divergente RdYlGn de **11 níveis**:

| Nível | Cor | Interpretação |
|---|---|---|
| **+5** | 🟢 Verde escuro `#006837` | Forte sinal positivo |
| **+4** | 🟢 Verde `#1a9850` | Bullish |
| **+3** | 🟢 Verde médio `#66bd63` | Moderadamente positivo |
| **+2** | 🟢 Verde claro `#a6d96a` | Positivo |
| **+1** | 🟡 Amarelo-verde `#d9ef8b` | Levemente positivo |
| **0** | 🟡 Amarelo `#ffffbf` | Neutro |
| **−1** | 🟠 Laranja claro `#fee08b` | Levemente negativo |
| **−2** | 🟠 Laranja `#fdae61` | Negativo |
| **−3** | 🔴 Vermelho-laranja `#f46d43` | Moderadamente negativo |
| **−4** | 🔴 Vermelho `#d73027` | Bearish |
| **−5** | 🔴 Vermelho escuro `#a50026` | Forte sinal negativo |

Cada indicador tem `dir: +1` (maior é melhor) ou `dir: -1` (menor é melhor) e thresholds `lo`/`hi`. Clique no ícone do heatmap para ver a legenda completa.

---

## 🛡️ Segurança

- ✅ `js/secrets.local.js` está no `.gitignore` — **sua FRED API key nunca sai do seu computador**
- ✅ `secrets.example.js` é um template seguro (sem keys reais) que pode ser commitado
- ⚠️ Nunca cole sua API key direto em qualquer outro arquivo — só em `secrets.local.js`

---

## 📦 Tecnologias

- [Chart.js 4](https://www.chartjs.org/) — gráficos
- [chartjs-adapter-date-fns](https://github.com/chartjs/chartjs-adapter-date-fns) — escala temporal
- [chartjs-plugin-annotation](https://www.chartjs.org/chartjs-plugin-annotation/) — linhas de referência
- [SheetJS (xlsx)](https://sheetjs.com/) — import Excel para ISM
- [TradingView Widgets](https://www.tradingview.com/widget/) — gráficos B3 ao vivo
- [Google Fonts](https://fonts.google.com/) — Inter, Playfair Display, Roboto

---

## 📝 Licença

MIT License — veja [LICENSE](LICENSE) para detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Algumas ideias:

- Mapear FRED IDs para indicadores ainda faltantes
- Adicionar séries de outros países (Eurozona, China, Reino Unido)
- Implementar export para PDF do dashboard
- Backend em Node.js para servir os dados (eliminando CORS proxy)
- Modo de comparação multi-país

---

## 🙏 Agradecimentos

- [FRED](https://fred.stlouisfed.org/) — por disponibilizar gratuitamente uma das maiores bases de dados macro do mundo
- [BACEN](https://www.bcb.gov.br/) — pela API SGS aberta e completa
- [TradingView](https://www.tradingview.com/) — pelos widgets gratuitos de mercado
