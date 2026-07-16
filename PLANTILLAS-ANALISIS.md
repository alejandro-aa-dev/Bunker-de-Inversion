# PLANTILLAS DE ANÁLISIS — Búnker 3.0

*(Fase 2 — Modelo de Dominio. Catálogo validado por Ale el 2026-07-16.
Complementa MODELO-DOMINIO.md: desarrolla el atributo "plantilla de análisis" de
Empresa y los modelos/parámetros de Valoración y Calidad.)*

## 1. Qué es una plantilla

Una **plantilla de análisis** define, para un tipo de negocio:

- **(a)** las 3 métricas de nivel que puntúan su **Calidad** y sus umbrales,
- **(b)** el umbral de **balance** que se le exige,
- **(c)** los **modelos de Valoración** que se activan y su regla de síntesis.

Las dimensiones **Trayectoria** y **Foso** de Calidad son universales: se evalúan
igual en todas las plantillas.

**Reglas** (validadas en MODELO-DOMINIO.md):
- Toda Empresa tiene exactamente **una** plantilla, derivada automáticamente de su
  sector GICS (§3) y **sobrescribible por empresa**.
- El **margen de seguridad NO lo fija la plantilla**: es manual por empresa,
  criterio de Ale (10-35% orientativo). *"No es lo mismo NVIDIA que una startup
  de semiconductores."* (Decisión 2026-07-16.)
- El catálogo está **completo por adelantado** (decisión 2026-07-16): cualquier
  empresa futura, del sector que sea, cae en una plantilla sin trabajo previo.

## 2. Ponderación con fuentes externas (corrección respaldada por evidencia)

El precio objetivo combina el valor intrínseco con fuentes externas **opcionales**
(InvestingPro, consenso de analistas). Las ponderaciones heredadas (COMP 45/35/20,
CICL 30/50/20, REIT 35/45/20, resto 40/40/20) daban a los externos entre el 55% y
el 70% del peso. La evidencia lo desaconseja: los precios objetivo de analistas se
cumplen solo el 24-45% de las veces, con sesgo optimista sistemático de +9,4% y
54% de acierto direccional (una moneda al aire), por incentivos estructurales de
la banca de inversión.

**Ponderación vigente (2026-07-16), parámetro global único:**

```
PESO_INTRINSECO = 65% · PESO_INVESTINGPRO = 25% · PESO_ANALISTAS = 10%
```

- Uniforme para todas las plantillas (ajustable por plantilla si algún día hace falta).
- Externos ausentes → su peso se redistribuye al intrínseco (hasta 100% intrínseco).

*Fuentes: [accuracy multi-dimensional de price targets](https://www.sciencedirect.com/science/article/abs/pii/S1059056024000960) ·
[18 años de datos](https://anachart.com/how-accurate-are-analyst-price-targets/) ·
[habilidad diferencial de analistas](http://assets.csom.umn.edu/assets/37727.pdf)*

## 3. Mapeo GICS → plantilla (cobertura total)

| Sector GICS | Plantilla por defecto |
|---|---|
| Energía | CICL |
| Materiales | CICL |
| Industriales | COMP |
| Consumo discrecional | COMP |
| Consumo básico | COMP |
| Salud | FARMA |
| Financieras | BANCO / SEGURO / HOLDING (según industria GICS) |
| Tecnología de la información | TECH |
| Servicios de comunicación | TELECOM (operadoras) / TECH (plataformas) |
| Utilities | UTIL |
| Inmobiliario | REIT |

Siempre sobrescribible por empresa (ej.: Amazon, Consumer Discretionary por GICS,
puede analizarse como TECH).

## 4. El catálogo — 10 plantillas

Origen de los valores: **COMP y los umbrales de balance** vienen del sistema actual
(auditoría Parte B, verificados). Los umbrales de nivel del resto son **estándares
profesionales de referencia**; ⚠️ durante la migración se contrastarán con los
valores reales del Sheet (editables fila a fila hoy) y donde difieran decide Ale.

### 4.1 COMP — Compounder / negocio de calidad general

| | |
|---|---|
| Calidad (nivel) | ROIC >12% · Margen operativo >15% · Crec. ingresos >5% |
| Balance | ND/EBITDA <3x |
| Valoración | DCF 2 fases + Graham → media; si divergen >1,5× o uno ≤0, el más prudente |
| Sectores típicos | Industriales, consumo, farma madura, hardware maduro |

### 4.2 TECH — Tecnología / software en crecimiento ⭐ nueva

| | |
|---|---|
| Calidad (nivel) | Margen bruto >70% · Rule of 40 ≥40 · Crec. ingresos >15% |
| Balance | ND/EBITDA <2x o caja neta |
| Valoración | DCF 2 fases con caps de crecimiento más altos + contraste EV/Sales |
| Razón de ser | Una SaaS analizada como COMP suspende injustamente (margen operativo bajo mientras reinvierte); el hueco más claro del búnker antiguo |

### 4.3 CICL — Cíclica (incluye energía y materiales)

| | |
|---|---|
| Calidad (nivel) | ROIC medio de ciclo >10% · Margen EBITDA >12% · FCF positivo en valle |
| Balance | ND/EBITDA <2,5x |
| Valoración | EV/EBITDA mid-cycle (EBITDA/acc medio de ciclo × múltiplo objetivo − deuda neta/acc) |
| Trampa que evita | Valorar en pico de ciclo con múltiplos "baratos" |

### 4.4 REIT — Inmobiliario cotizado

| | |
|---|---|
| Calidad (nivel) | Crec. AFFO/acc >3% · Ocupación >90% · Payout AFFO <90% |
| Balance | ND/EBITDA <7x |
| Valoración | 0,6 × AFFO × P/AFFO objetivo (def. 20) + 0,4 × NAV |
| Trampa que evita | El P/E engaña: la depreciación contable hunde el beneficio sin ser gasto real |

### 4.5 BANCO

| | |
|---|---|
| Calidad (nivel) | ROE >10% · Ratio de eficiencia <60% · CET1 >12% |
| Balance | El capital ES la métrica (CET1); ND/EBITDA no aplica |
| Valoración | P/BV justo = (ROE−g)/(r−g); H = BV/acc × P/BV justo |
| Trampa que evita | El DCF no funciona: la deuda es su materia prima, no financiación |

### 4.6 SEGURO

| | |
|---|---|
| Calidad (nivel) | ROE >10% · Combined ratio <100% · Crec. primas >3% |
| Balance | Solvencia (ídem BANCO) |
| Valoración | P/BV justo (como BANCO) |

### 4.7 UTIL — Utility regulada

| | |
|---|---|
| Calidad (nivel) | ROE >8% · Margen EBITDA >25% · Payout <80% |
| Balance | ND/EBITDA <6,5x (deuda alta estructural es normal; mirar cobertura) |
| Valoración | DDM: DPS×(1+g)/(r−g), g capado |

### 4.8 HOLDING — Conglomerado / holding de participadas

| | |
|---|---|
| Calidad (nivel) | Crec. NAV >5% · Descuento vs. su media histórica · Calidad de participadas |
| Balance | Caja neta |
| Valoración | NAV × (1−descuento) |
| Trampa que evita | Valorarlo con P/E consolidado |

### 4.9 FARMA — Salud / farmacéuticas ⭐ nueva

| | |
|---|---|
| Calidad (nivel) | ROIC >10% · Margen operativo >20% · I+D/ventas sostenido 10-20% |
| Balance | ND/EBITDA <3x |
| Valoración | DCF 2 fases + contraste P/E vs. su media histórica |
| Trampa que evita | Beneficio actual sin mirar el patent cliff (expiración de patentes → vigilar en la tesis/foso) |

### 4.10 TELECOM — Operadoras ⭐ nueva

| | |
|---|---|
| Calidad (nivel) | Margen EBITDA >30% · FCF positivo sostenido · CAPEX/ventas <20% |
| Balance | ND/EBITDA <3,5x |
| Valoración | EV/EBITDA comparable + DDM si es dividendera estable |
| Trampa que evita | Deuda intensiva estructural disfrazada de yield atractivo |

## 5. Parámetros del motor (con nombre, heredados del sistema actual)

Constantes hoy hardcodeadas en fórmulas que pasan a ser parámetros globales con
nombre (valores por defecto = los actuales, verificados en auditoría):

| Parámetro | Default | Dónde vivía |
|---|---|---|
| TASA_EXIGIDA | 9% | DCF, P/BV justo, DDM |
| CRECIMIENTO_TERMINAL | 2,5% | DCF fase terminal |
| CAP_CRECIMIENTO_DCF_F1 / F2 | 15% / 6% | DCF fases 1 y 2 |
| CAP_CRECIMIENTO_GRAHAM | 12% | Fórmula Graham |
| CAP_CRECIMIENTO_DDM | 5,5% | DDM utilities |
| P_AFFO_OBJETIVO | 20 | REIT |
| PESOS_REIT (AFFO/NAV) | 60/40 | REIT |
| UMBRAL_DIVERGENCIA_MODELOS | 1,5× | Síntesis COMP (regla del prudente) |
| PESO_INTRINSECO / IP / ANALISTAS | 65/25/10 | §2 (corregido 2026-07-16) |
| UMBRAL_BUENA_COMPRA / RAZONABLE | 25% / 10% | Veredicto (Decisión) |
| TRAMOS_TECNICOS | 0/−10/−20% vs SMA200 | Señal técnica |

*(El catálogo completo de parámetros, incluidos los de TECH/FARMA/TELECOM que no
existían, se cerrará en el documento de parámetros de la planificación de Fase 3.)*
