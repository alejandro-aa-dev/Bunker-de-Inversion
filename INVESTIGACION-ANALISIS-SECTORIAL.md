# INVESTIGACIÓN — Análisis profesional por sector y fuentes de datos

*(Fase 2 — documento de investigación previo al modelado del concepto **Empresa**.
No es una decisión de diseño: es la base documental para tomarlas.)*

Fecha: 2026-07-16 · Investigado por: Claude Code · Solicitado por: Ale

---

## 1. Cómo analizan los profesionales

### 1.1 Las 6 áreas universales

Independientemente del sector, un análisis fundamental profesional cubre siempre:

| Área | Qué mide | Métricas típicas |
|---|---|---|
| **Valoración** | ¿Cotiza cara o barata? | P/E, EV/EBITDA, P/FCF, P/B, P/S, PEG |
| **Rentabilidad** | ¿Con qué eficiencia genera beneficio? | ROE, ROIC, ROCE, ROA, márgenes (bruto/operativo/neto/FCF) |
| **Salud financiera** | ¿Es sostenible su deuda? | Deuda neta/EBITDA, Deuda/Equity, cobertura de intereses, ratio corriente |
| **Crecimiento** | ¿Crece el negocio? | CAGR de ingresos y BPA (3/5/10 años) |
| **Dividendo** (si lo hay) | ¿Es sostenible y creciente? | Yield, payout, años de crecimiento consecutivo |
| **Posición competitiva** | ¿Tiene foso (moat)? | Cuota de mercado, pricing power, comparación vs. pares |

**Clave**: las 6 áreas son universales, pero **qué métrica manda en cada área y qué
modelo de valoración aplica depende del sector**.

### 1.2 Métrica y modelo de valoración por sector

Evidencia académica (Olbert 2023, mercado USA): el **P/E es el modelo preferido en
20 de los 25 grupos GICS**; **EV/EBITDA** domina en telecom, energía y materiales;
los sectores financieros e inmobiliario usan modelos propios.

| Sector | Múltiplo principal | Modelo de valoración | Métricas específicas del sector | Trampa a evitar |
|---|---|---|---|---|
| **Bancos** | P/B + P/E | Dividend Discount / Excess Returns (NO DCF) | ROE, ROA, ratio de eficiencia, morosidad, CET1, loan-to-deposit | El DCF clásico no funciona: la deuda es su materia prima, no financiación |
| **Seguros** | P/B + P/E | DDM / Excess Returns | ROE, combined ratio, float | Ídem bancos |
| **REITs / Inmobiliario** | P/FFO, P/AFFO | NAV (valor neto de activos) | FFO/AFFO por acción, ocupación, LTV | El P/E engaña: la depreciación contable hunde el beneficio sin ser gasto real |
| **Utilities** | P/E + Dividend Yield | DDM | ROE regulado, RAB, payout | Deuda alta es normal; mirar cobertura, no nivel absoluto |
| **Tecnología / SaaS** | EV/Sales, PEG | DCF con escenarios de crecimiento | Crecimiento de ingresos, margen bruto, Rule of 40, retención (NRR), CAC/LTV | El P/E castiga injustamente a empresas que reinvierten todo |
| **Energía / Materiales** | EV/EBITDA | NAV de reservas / DCF cíclico | Reservas, coste de extracción, ciclo de precios | Valorar en pico de ciclo con múltiplos "baratos" |
| **Telecom** | EV/EBITDA | DCF | CAPEX/ventas, ARPU, churn | Deuda intensiva estructural |
| **Consumo (estable)** | P/E, P/FCF | DCF / Graham | Márgenes, ventas comparables (LFL), poder de marca | Pagar de más por la "calidad" |
| **Industriales** | EV/EBIT | DCF | Book-to-bill, margen operativo, ciclo | Ciclicidad disfrazada de crecimiento |
| **Farma / Salud** | P/E ajustado | DCF por pipeline | Pipeline, patentes (expiraciones), I+D/ventas | Beneficio actual sin mirar el patent cliff |
| **Holdings / Conglomerados** | Descuento sobre NAV | Suma de partes (SOTP) | NAV, descuento histórico | Valorarlos con P/E consolidado |

### 1.3 Modelos de valoración intrínseca (catálogo)

- **DCF** (descuento de flujos de caja) — empresas con FCF predecible. El más universal, pero sensible a hipótesis.
- **DDM** (descuento de dividendos) — bancos, seguros, utilities.
- **Número de Graham** — filtro rápido de valor: √(22.5 × BPA × VC por acción).
- **Lynch Fair Value (PEG)** — crecimiento a precio razonable: PER justo ≈ tasa de crecimiento.
- **Múltiplos comparables** — vs. pares del sector y vs. media histórica propia (5-10 años).
- **NAV / Suma de partes** — REITs, holdings, materias primas.

**Conclusión para el Búnker**: el motor actual de 7 modelos aplica lo mismo a todas
las empresas. El estándar profesional es **plantilla por sector**: cada sector define
(a) qué métricas puntúan, (b) con qué umbrales, (c) qué modelos de valoración aplican
y cuáles se desactivan. Con ~8-10 plantillas se cubre el universo del Búnker, y debe
poder sobrescribirse a nivel de empresa individual (personalizable).

---

## 2. Benchmark: AleInversor (aleinversor.com)

Herramienta española de análisis fundamental automatizado (7 €/mes, 50.000+ acciones,
30 años de historia). Referencia de "competencia" — el Búnker NO se comercializa,
pero sirve de vara de medir.

**Su método** (5 etapas): datos institucionales → cálculo de 30+ ratios → scoring
automático 0-100 por rangos → contexto histórico (vs. medias de 5 y 10 años) →
modelos de valoración intrínseca (Graham, DCF, Lynch Fair Value, DDM).

**Sus 6 scores (0-100)**: Valoración · Rentabilidad · Deuda · Crecimiento ·
Dividendos · Técnico (SMA, RSI, MACD, Bollinger). El score de cada categoría es la
media de sus métricas; el total, la media de las categorías.

**Extras**: comparador de empresas, gráfico Geraldine Weiss (dividendos), resúmenes
IA de conference calls con detección de red flags, watchlist.

**Lecciones para el Búnker 3.0**:
1. ✅ **Copiable**: scores 0-100 por área + score total; comparación de cada ratio contra la propia media histórica de la empresa (más justo que umbrales absolutos).
2. ✅ **Copiable**: separar el score Técnico del Fundamental (el Búnker ya tiene la pata técnica: RSI, SMA200, mínimos).
3. ⚠️ **Su debilidad = nuestra oportunidad**: su score es una media plana, aparentemente igual para todos los sectores. La diferenciación del Búnker sería **plantillas por sector** (§1.2) + pesos personalizables por el usuario.
4. ❌ **Fuera de alcance**: transcripciones de conference calls, 50k acciones, 30 años de datos. El Búnker es para cartera propia + radar, no un screener universal.

---

## 3. Fuentes de datos: qué da Google Finance y qué no

### 3.1 GOOGLEFINANCE (Google Sheets) — lo que SÍ ofrece

**Tiempo real (retraso ≤ 20 min)**: `price`, `priceopen`, `high`, `low`, `volume`,
`marketcap`, `volumeavg`, `pe`, `eps`, `high52`, `low52`, `change`, `changepct`,
`beta`, `shares`, `closeyest`, `currency`, `tradetime`, `datadelay`.

**Histórico (por fechas)**: `open`, `close`, `high`, `low`, `volume` (OHLCV diario).

**Cobertura del Búnker con esto**:
- ✅ **Análisis técnico COMPLETO**: con OHLCV histórico se calcula RSI, SMA50/200, mínimos 1m/3m/6m/1año, volatilidad, momentum, distancia a máximos… (el Búnker ya lo hace así).
- ✅ Valoración básica instantánea: P/E, EPS, capitalización, beta.

### 3.2 Lo que NO ofrece (el hueco fundamental)

GOOGLEFINANCE **no da estados financieros**: ni ingresos, ni márgenes, ni ROE/ROIC,
ni deuda, ni FCF, ni dividendos (yield/payout/historial), ni ningún dato por sector.
Tampoco expone el histórico vía API de Sheets (solo dentro de la propia hoja).
Cobertura irregular fuera de bolsas principales.

**Conclusión**: Google Finance sostiene la pata técnica al 100% y de la fundamental
solo P/E y EPS. Todo el análisis por sectores del §1 necesita una fuente complementaria.

### 3.3 Fuentes complementarias (para el fundamental)

| Fuente | Estado en el Búnker | Qué aporta | Coste |
|---|---|---|---|
| **stockanalysis.com** | ⭐ YA en uso (tarea dominical del Filtro de Calidad — proceso heredado, ver PA-001) | Estados financieros completos, ratios, dividendos (hasta 50 años), ~5 años de historia gratis; 130k+ valores | Gratis (scraping) — frágil ante cambios de la web |
| **Gemini API** | YA en uso (GEMINI_API_KEY en el sistema) | Datos puntuales / interpretación; no es fuente estructurada fiable para ratios | Ya integrado |
| APIs financieras (FMP, Finnhub, Alpha Vantage) | No usadas | Datos estructurados y estables vía API | Planes gratuitos con límites; opción futura si el scraping se rompe |

**Criterio "lo más automático posible, sin ruido"**: el fundamental cambia como mucho
trimestralmente → basta **una actualización semanal/mensual automática** (patrón que
ya existe: la tarea dominical). El técnico es diario/intradía → GOOGLEFINANCE en la
hoja, como ahora. No hace falta más frecuencia = no hace falta más ruido.

---

## 4. Implicaciones para el Modelo de Dominio (entrada para MODELO-DOMINIO.md)

1. La entidad **Empresa** necesita un atributo **sector/plantilla de análisis** que determine qué métricas la puntúan y qué modelos de valoración le aplican.
2. Los **modelos de valoración** no son globales: son un catálogo (§1.3) del que cada plantilla sectorial activa un subconjunto — con posibilidad de ajuste por empresa individual.
3. El conocimiento fundamental de una empresa se organiza en las **6 áreas universales** (§1.1), cada una con score 0-100 y comparación contra la media histórica propia.
4. La pata **técnica** queda separada del fundamental y ya está cubierta por GOOGLEFINANCE.
5. Los **pesos** entre áreas deben ser personalizables (perfil del usuario: dividendero vs. crecimiento vs. valor).
6. Frecuencias: técnico = diario (hoja) · fundamental = semanal/mensual (proceso batch tipo tarea dominical).

> Estos 6 puntos son hipótesis de partida para la pizarra de la Fase 2, no decisiones
> tomadas. Se validan concepto a concepto con las 5 preguntas.

---

## Fuentes

- [AleInversor](https://aleinversor.com/) — herramienta analizada como benchmark
- [Olbert (2023) vía Emerald — Financial analysts' use of industry specific stock valuation models](https://www.emerald.com/jaar/article/26/6/108/1267281/Financial-analysts-use-of-industry-specific-stock)
- [Industry-specific stock valuation methods — literature review (Journal of Accounting Literature)](https://www.emerald.com/jal/article/47/5/52/1267355/Industry-specific-stock-valuation-methods-a)
- [CFI — Bank Valuation: Why Traditional Methods Don't Work](https://corporatefinanceinstitute.com/resources/valuation/how-bank-valuation-works/)
- [Kotak Securities — Sector-Specific Valuation Metrics](https://www.kotaksecurities.com/stockshaala/introduction-to-fundamental-analysis/sector-specific-valuation-metrics/)
- [Wall Street Oasis — Guide to Valuation and Metrics By Sector](https://www.wallstreetoasis.com/forum/investment-banking/beginners-guide-to-valuation-and-metrics-by-sector)
- [Google — atributos de GOOGLEFINANCE](https://support.google.com/docs/answer/3093281)
- [stockanalysis.com](https://stockanalysis.com/) y [sus fuentes de datos](https://stockanalysis.com/financial-sources/)
