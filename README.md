# 📊 MacroDash

> Terminal de pesquisa macroeconômica para **Brasil** 🇧🇷 e **Estados Unidos** 🇺🇸 — dashboard estilo Bloomberg para acompanhar **300+ indicadores em tempo real**.

![Status](https://img.shields.io/badge/status-active-success)
![Stack](https://img.shields.io/badge/stack-vanilla%20JS-yellow)
![Data](https://img.shields.io/badge/data-FRED%20%2B%20BACEN-orange)
![Charts](https://img.shields.io/badge/charts-100%2B-blue)
![License](https://img.shields.io/badge/license-proprietary-red)

---

## 🎯 Visão Geral

**MacroDash** é um terminal de pesquisa macroeconômica de uso pessoal, que reúne **mais de 300 indicadores** das duas maiores economias do continente em uma única interface limpa, rápida e densa. Pensado para quem acompanha mercados, inflação, mercado de trabalho, política fiscal, política monetária e indicadores de risco — tudo em um só lugar, sem trocar de aba.

A interface combina **leitura visual instantânea** (via heatmap divergente de 11 níveis) com **profundidade analítica** (via gráficos interativos com explicações contextuais para cada indicador, contando o que ele significa, o que ocorre quando sobe ou cai, e por que importa acompanhar).

---

## ✨ Highlights

### 🔥 Cobertura completa de macroeconomia
- **150+ séries USA** (Federal Reserve · FRED)
- **150+ séries Brasil** (Banco Central do Brasil · BACEN SGS)
- Atualização automática conforme as fontes oficiais publicam

### 🎨 Heatmap RdYlGn de 11 níveis
Escala divergente de cores (verde escuro → amarelo → vermelho escuro) que classifica cada indicador conforme thresholds configurados, permitindo ler dezenas de séries de relance.

### 📊 100+ gráficos interativos
Distribuídos em 16 abas USA + 11 abas Brasil:
- Atividade Econômica, PIB, Inflação, Mercado de Trabalho, Política Fiscal
- Crédito, Agregados Monetários, Setor Externo
- Política Monetária, GDP, ECI, CPI, PCE+PPI
- Housing Market, Financial Accounts, Trade Balance
- Mercado de Ações (S&P 500, VIX, HY Spread, Treasury)
- Indicadores de Recessão (Sahm Rule, Yield Curve, Recession Probability)
- Índices da B3 em tempo real (IBOV, SMLL, IBrX, IFIX, IDIV, IBHB)

### 💡 Explicações contextuais (botão "?")
Cada gráfico tem um botão de ajuda que abre um painel com **4 seções**:
- **O que mostra** — definição técnica
- **Quando sobe** — implicações macroeconômicas
- **Quando cai** — implicações macroeconômicas
- **Por que acompanhar** — relevância no ciclo econômico

### 🧮 Cálculos derivados
Variações YoY, MoM, médias móveis 3M, anualizações compostas 3M/6M, núcleos médios do IPCA, somas anuais, ratios cruzados (JOLTs/Unemployment, etc.).

### 📈 Dual view
Cada aba alterna entre **Gráficos com KPIs** e **Tabela histórica** com 36 meses por indicador.

### 🎨 Design
Tema preto + laranja com tipografia Playfair Display nos títulos, Inter no corpo e Roboto em elementos de UI. Inspirado em terminais de research profissionais.

---

## 🏗️ Stack

- **Frontend:** Vanilla JavaScript (sem framework, sem build step)
- **Charts:** Chart.js 4 + plugins de adapter temporal e annotations
- **Tipografia:** Inter, Playfair Display, Roboto (Google Fonts)
- **Dados em tempo real:** FRED API (USA) e BACEN SGS (Brasil)
- **Mercado B3:** Widgets oficiais do TradingView

---

## 📷 Screenshots

> A serem adicionadas

---

## 🛡️ Privacidade & Segurança

- Todas as configurações sensíveis ficam **localmente no computador do usuário** (incluindo a API key do FRED), nunca expostas no repositório
- Cache de dados em memória, sem persistência em servidores externos
- Não coleta nenhum dado de uso, telemetria ou analytics

---

## 📝 Licença

Este projeto é **propriedade pessoal**. Não é licenciado para uso, modificação ou redistribuição por terceiros. Veja [LICENSE](LICENSE) para os termos completos.

---

## 👤 Autor

**Thiago Favareto**
- GitHub: [@tfavareto](https://github.com/tfavareto)
