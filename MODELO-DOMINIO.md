# MODELO DE DOMINIO — Búnker 3.0

*(Fase 2 — en construcción. Cada concepto entra aquí solo después de pasar por la
pizarra —las 5 preguntas— y ser validado por Ale. Método: `METODOLOGIA.md` §5.)*

## Pregunta fundacional

**¿Qué sabe el Búnker sobre una empresa?**

No cómo lo calcula.

No dónde lo almacena.

No cómo lo muestra.

**Solo qué sabe.**

---

## Mapa de conceptos

| Concepto | Estado |
|---|---|
| **Empresa** | ✅ Validado (2026-07-16) |
| **Inversor** | ✅ Validado (2026-07-16) |
| **Valoración** | ✅ Validado (2026-07-16) |
| **Calidad** | ✅ Validado (2026-07-16) |
| **Señal técnica** | ✅ Validado (2026-07-16) |
| **Decisión y Ranking** | ✅ Validado (2026-07-16) |
| **Cartera** | ✅ Validado (2026-07-16) |
| Alerta | Pendiente (personalizable *por Inversor*) |

---

## 1. EMPRESA ✅

*Validado por Ale el 2026-07-16.*

### 1.1 ¿Qué significa exactamente?

Una **Empresa** es un negocio cotizado sobre el que el Búnker mantiene conocimiento
y opinión. Es el sujeto de todo el sistema: todo lo demás (valoración, señales,
alertas, carteras) es conocimiento *sobre* una Empresa.

Una Empresa **no es un ticker**: el ticker es solo su identificador de mercado.
La Empresa sigue existiendo en el Búnker aunque cambie de ticker, de bolsa o de divisa.

La Empresa es **objetiva y única**: sus datos, su sector y su valoración calculada
son los mismos para todos. Las opiniones personales sobre ella (tesis, preferencias
de alertas) NO viven en la Empresa sino en la relación de cada Inversor con ella
(ver concepto Inversor).

### 1.2 ¿Qué atributos tiene?

**Identidad** (casi nunca cambia)
- Nombre
- Ticker + mercado donde cotiza
- Divisa de cotización
- País

**Clasificación** (cambia rara vez)
- **Sector oficial (GICS)** — hecho objetivo (ej.: Iberdrola → Utilities).
- **Plantilla de análisis** — decisión del Búnker: qué métricas la puntúan y qué
  modelos de valoración le aplican. **Por defecto se deriva automáticamente del
  sector GICS**, pero puede sobrescribirse para una empresa concreta
  (ej.: Amazon es Consumer Discretionary por GICS pero puede analizarse como tech).
  Base: `INVESTIGACION-ANALISIS-SECTORIAL.md`.

**Estado en el Búnker** (uno y solo uno en cada momento)

| Estado | Quién lo decide | Significado |
|---|---|---|
| **En cartera** | Un Inversor (compra real) | Al menos un Inversor la tiene en su cartera |
| **Seleccionada** | **El Búnker (automático)** | Del radar, pasa los filtros. Asciende y desciende sola: si deja de pasarlos vuelve al radar. Cada tránsito genera una Alerta natural |
| **En el radar** | Ale (u otro Inversor) | Vigilada pero no pasa los filtros |
| **Archivada** | Ale | Ya no se vigila; no se borra (patrimonio histórico, METODOLOGIA.md §7) |

Los estados **radar / seleccionada / archivada son globales** del Búnker (el
conocimiento se comparte). Solo la cartera —y las tesis y preferencias de alertas—
son personales de cada Inversor.

### 1.3 ¿Qué NO forma parte de Empresa?

- ❌ Sus precios y datos de mercado — conocimiento que fluye (→ Señal técnica / Mercado).
- ❌ Su valoración — opinión calculada con fecha (→ Valoración).
- ❌ Su posición en cartera (acciones, precio medio) — pertenece a la Cartera de cada
  Inversor; la Empresa no sabe quién la tiene comprada.
- ❌ Las tesis personales ("la entiendo y quiero mantenerla") — relación Inversor↔Empresa.
- ❌ Las alertas que genera — son eventos, no atributos.
- ❌ Cómo se muestra (radar, iconos) — presentación, no dominio.

Esta separación es la que elimina el monolito actual (la "fila que lo sabe todo" del Sheet).

### 1.4 ¿Qué la alimenta?

- **Ale (o un Inversor)**: alta manual y consciente — el Búnker no descubre empresas
  solo. Dar de alta = asignar identidad + sector (la plantilla viene sola) + estado inicial.
- **Google Finance**: valida la identidad de mercado (ticker, divisa) — automático.
- Nada más: los datos financieros no alimentan a Empresa; alimentan a los conceptos
  que hablan *de* ella.

### 1.5 ¿Quién la consume?

Todos los demás conceptos: Valoración, Calidad, Señal técnica, Ranking, Cartera y
Alerta trabajan siempre *sobre una Empresa*. Es el punto de unión del modelo
(el papel que hoy hace "la fila del Sheet").

---

## 2. VALORACIÓN ✅

*Validado por Ale el 2026-07-16.*

### 2.1 ¿Qué significa exactamente?

La **Valoración** es la opinión calculada del Búnker sobre **cuánto vale una
Empresa**, con fecha. Responde a "¿qué vale?" — no a "¿qué hago?" (Decisión)
ni a "¿es buen negocio?" (Calidad). Es **objetiva y compartida**: la misma para
todos los Inversores; lo que cada uno haga con ella es su tesis personal.

En el dominio existe **UNA** Valoración por Empresa (las tres réplicas del motor
actual —Bunker USA/exUSA, Carteras, mini búnker— son un artefacto de
implementación, redundancia R14 de la auditoría).

### 2.2 ¿Qué atributos tiene?

Cadena de cuatro eslabones (generaliza el motor actual, auditoría Parte B §2):

1. **Valor intrínseco** — lo que valen los números del negocio según los modelos
   que activa la **plantilla** de la Empresa. Cada plantilla activa **1..N modelos
   del catálogo** (DCF, Graham, DDM, P/BV justo, NAV, mid-cycle…) y define su
   **regla de síntesis** (media; el más prudente si divergen — regla heredada de COMP).
2. **Precio objetivo combinado** — el intrínseco contrastado con opiniones externas
   (consenso de analistas, InvestingPro) con ponderaciones por plantilla.
   **Las fuentes externas son OPCIONALES** (decisión 2026-07-16): si no están
   alimentadas, el precio objetivo se apoya solo en el intrínseco en vez de quedar
   vacío. *(Esto sustituye la regla actual "si falta H, I o J → K vacío".)*
3. **Margen de seguridad → precio de entrada** (precio objetivo × (1 − margen)).
4. **Potencial** — distancia entre precio actual y precio objetivo.

Transversales:
- **Fecha de cálculo** y plantilla/modelos/parámetros usados (trazabilidad).
- **Overrides manuales**: valor intrínseco manual y margen de seguridad — el
  criterio de Ale siempre puede pisar el cálculo.
- **Parámetros con nombre, definidos por plantilla** (con default global):
  tasa exigida, crecimiento terminal, caps de crecimiento, ponderaciones de
  síntesis… *(Hoy están hardcodeados en fórmulas: 9%, 2,5%, 15%/12%/6%/5,5%,
  45/35/20… Mismo comportamiento, pero visibles, documentados y personalizables.)*

### 2.3 ¿Qué NO forma parte de Valoración?

- ❌ El **semáforo/DECISIÓN** (🔥/✅/🟡/⏳) — conclusión operativa → Ranking/Decisión.
  La Valoración dice "vale 100 y cotiza a 70"; la Decisión dice "compra".
- ❌ El **Filtro de Calidad** — juicio distinto ("¿es buen negocio?"), previo e
  independiente. Hoy están entrelazados (gate BO); en el dominio son conceptos
  separados que el Ranking combina.
- ❌ El **precio de mercado** — la Valoración lo usa, no lo posee.

### 2.4 ¿Qué la alimenta?

- **Datos fundamentales** de la Empresa (FCF, EPS, BV, AFFO, EBITDA, DPS…) —
  fuente automática tipo stockanalysis, frecuencia semanal (sin ruido).
- **La plantilla de análisis** de la Empresa → modelos activos + parámetros.
- **Opiniones externas** (opcionales): consenso de analistas, InvestingPro.
- **Overrides de Ale**: intrínseco manual, margen de seguridad.

### 2.5 ¿Quién la consume?

- **Ranking/Decisión** — la combina con Calidad y precio para el veredicto.
- **Alerta** — los cambios relevantes ("entró en zona de precio de entrada") son eventos alertables.
- **Inversor** — cada uno la lee contra su tesis personal.

---

## 3. CALIDAD ✅

*Validado por Ale el 2026-07-16. Investigación previa: Piotroski F-Score,
factor calidad MSCI, Economic Moat de Morningstar (fuentes al pie).*

### 3.1 ¿Qué significa exactamente?

La **Calidad** es el juicio del Búnker sobre si una Empresa es **un buen negocio**,
independientemente de su precio. Responde a "¿merece este negocio mi dinero a algún
precio?"; la Valoración responde después "¿a qué precio?". Es el **guardián del
sistema**: lo que no pasa Calidad no se valora en serio (rol de gate que ya cumple
el filtro actual).

### 3.2 ¿Qué atributos tiene?

**Cuatro dimensiones** (las dos primeras heredan del filtro actual, que ya era
sectorial; las dos nuevas salen de la investigación):

| Dimensión | Qué mide | Cómo | Automático |
|---|---|---|---|
| **Rentabilidad del negocio** | Nivel: ROIC, márgenes… según plantilla | Umbrales por plantilla (hereda del filtro 2 capas) | ✅ |
| **Solidez del balance** | Deuda sostenible | ND/EBITDA + cobertura de intereses, por plantilla | ✅ |
| **Trayectoria** ⭐ | Mejora/deterioro año contra año + estabilidad histórica | Estilo Piotroski, con ~5 años de datos | ✅ |
| **Foso (moat)** ⭐ | Ventaja competitiva duradera | Juicio humano asistido (ver 3.2.1) | ❌ |

- **Score 0-100 por dimensión + veredicto derivado** (decisión: ambos). El score da
  matiz; el veredicto decide. El veredicto se deriva del score con umbrales por
  plantilla y mantiene los tres estados actuales: **DESCARTAR / VIGILAR / ANALIZAR**.
- **Override manual de Ale** sobre el veredicto (hoy col S) — se conserva, es sagrado.
- **Fecha de los datos** (hoy col T) — se conserva: calidad sin fecha no es conocimiento.

#### 3.2.1 El Foso — juicio humano asistido

Checklist de las **5 fuentes de Morningstar** (costes de cambio, intangibles/marca,
efecto red, ventaja en costes, escala eficiente), respondido sí/no:
0 síes = sin foso · 1 = estrecho · 2+ claros = ancho.

Flujo acordado (2026-07-16):
1. Al dar de alta una empresa, **la IA investiga y propone** el checklist
   pre-contestado con un argumento por respuesta.
2. **Ale valida o corrige** (2-3 min). La decisión registrada es siempre la humana:
   se guarda propuesta IA + veredicto de Ale + fecha + motivo de cada "sí".
3. **Revisable**: no es una sentencia; se cambia con fecha y motivo si la realidad
   lo desmiente (Morningstar cambia moats todos los meses).
4. **Default prudente**: ante la duda, "no". Equivocarse en contra solo exige más
   margen de seguridad; el error peligroso (regalar foso) queda bloqueado por diseño.
5. El foso **no decide solo**: es 1 de 4 dimensiones; las otras tres son numéricas.

### 3.3 ¿Qué NO forma parte de Calidad?

- ❌ El precio y la valoración — un negocio excelente puede estar carísimo.
- ❌ La decisión de compra — Ranking combina Calidad + Valoración + precio.
- ❌ La señal técnica — RSI/SMA no dicen nada de la calidad del negocio.
- ❌ La antigua "Capa 3" de valoración (eliminada por Ale, LÉEME §13) — decisión
  confirmada en el dominio.

### 3.4 ¿Qué la alimenta?

- **Datos fundamentales históricos** (~5 años) — automático, semanal. *(Integra en
  el dominio la tarea dominical de stockanalysis — el proceso heredado de PA-001
  deja de ser un misterio y pasa a tener sitio propio.)*
- **La plantilla** de la Empresa → métricas y umbrales aplicables.
- **El juicio de Ale**: foso (al alta, asistido) y override del veredicto.

### 3.5 ¿Quién la consume?

- **Ranking/Decisión** — como gate y como matiz del veredicto.
- **El estado "Seleccionada"** de Empresa — pasar/dejar de pasar Calidad es lo que
  sube/baja empresas del radar (con Alerta en cada tránsito).
- **Alerta** — el **deterioro de Calidad de una empresa en cartera es alerta
  prioritaria** (decisión 2026-07-16; hoy el sistema solo alerta de precio/técnico —
  hueco cerrado).

*Fuentes: [Piotroski F-Score](https://www.quantconnect.com/research/15728/piotroski-f-score-investing/) ·
[mejoras al F-Score / calidad MSCI](https://alphaarchitect.com/value-investing-factor-research-how-to-improve-the-piotroski-f-score-measure/) ·
[Morningstar Economic Moat](https://www.morningstar.com/stocks/morningstar-economic-moat-rating-3) ·
[las 5 fuentes del moat](https://www.morningstar.com/stocks/how-measure-companys-competitive-advantage)*

---

## 4. SEÑAL TÉCNICA ✅

*Validado por Ale el 2026-07-16. Investigación previa: SMA200 como indicador de
régimen (Faber, Siegel), momentum de máximos de 52 semanas vs "cuchillo cayendo",
evidencia sobre Fibonacci/Gann (fuentes al pie).*

### 4.1 ¿Qué significa exactamente?

La **Señal técnica** es lo que el Búnker sabe sobre el **comportamiento del precio**
de una Empresa: tendencia, temperatura de corto plazo y extremos. Responde a una
única pregunta: **"¿es buen momento para ejecutar?"** — nunca "¿qué compro?".

**Ley de subordinación** (principio del dominio, validado 2026-07-16):

> La técnica nunca elige la empresa; solo el momento. Solo se escucha sobre
> empresas que ya pasaron Calidad y están baratas según Valoración.

Esto salva al sistema del "cuchillo cayendo": comprar mínimos de cualquier cosa
pierde dinero (evidencia); comprar mínimos de un buen negocio infravalorado es la
disciplina value. El sistema antiguo ya lo hacía de facto (tramos solo con semáforo
GANGA/BUENA); aquí se convierte en ley explícita.

### 4.2 ¿Qué atributos tiene?

Cuatro lecturas + un plan, todo 100% automático:

1. **Tendencia** — precio vs SMA200 y distancia (el indicador de régimen con más
   respaldo empírico). Hereda las alertas actuales (🔴 bajo SMA / 🟡 ≤2%).
2. **Temperatura de corto plazo** — RSI (sobreventa/sobrecompra).
3. **Extremos** — distancia a máximo/mínimo de 52 semanas y mínimos 1m/3m/6m/1año.
   **Reencuadre validado**: un mínimo nuevo NO es señal de compra autónoma; es
   *contexto de oportunidad* que solo significa algo en empresas seleccionadas o
   en cartera.
4. **Plan de entrada por tramos** — niveles escalonados como **parámetros con
   nombre** (default heredado: 0% / −10% / −20% vs SMA200). La mejor pieza técnica
   del búnker antiguo: convierte "comprar barato" en disciplina por etapas.
5. **Fecha/frescura** de la lectura.

La técnica es **universal, sin plantillas por sector** (a diferencia de Valoración
y Calidad): complejidad solo donde aporta.

**Indicadores descartados deliberadamente** (decisión 2026-07-16, delegada por Ale
al criterio investigado): MACD y Bollinger (redundantes con SMA200+RSI, más ruido
sin más información) y **Fibonacci/Gann** (evidencia académica mixta o nula; exigen
elección subjetiva de puntos de anclaje → inautomatizables de forma fiable; y son
herramientas de trading de corto plazo — responden una pregunta que el Búnker no
hace). TradingView queda como herramienta personal de pantalla de Ale, fuera del
dominio del Búnker.

### 4.3 ¿Qué NO forma parte de Señal técnica?

- ❌ La decisión de compra — la técnica es una *condición*, el Ranking decide.
- ❌ Valoración y Calidad — la técnica no sabe si el negocio es bueno ni qué vale.
- ❌ Las alertas — consumen la señal, no son la señal.
- ❌ Predicciones — describe el presente del precio; no pronostica.

### 4.4 ¿Qué la alimenta?

- **Google Finance (OHLCV)** exclusivamente — pata 100% cubierta y automática
  (INVESTIGACION-ANALISIS-SECTORIAL.md §3.1). Frecuencia diaria, dentro del horario
  operativo (8:00-24:00). Cero mantenimiento manual.

### 4.5 ¿Quién la consume?

- **Ranking/Decisión** — como dimensión de *timing* del veredicto.
- **Alerta** — cruces de SMA200, entrada en tramos, mínimos nuevos (cartera/
  seleccionadas), RSI extremo.
- **Inversor** — cada uno la lee contra sus posiciones y su tesis.

*Fuentes: [Faber — Quantitative Approach to TAA](https://mebfaber.com/wp-content/uploads/2016/05/SSRN-id962461.pdf) ·
[52-week high momentum (George & Hwang)](https://www.bauer.uh.edu/tgeorge/papers/gh4-paper.pdf) ·
[Fibonacci: evidencia empírica](https://www.sciencedirect.com/science/article/abs/pii/S0957417421012495) ·
[Magic numbers in the Dow](https://openaccess.city.ac.uk/id/eprint/16276/1/magic%20numbers%20in%20the%20dow.pdf)*

---

## 5. DECISIÓN Y RANKING ✅

*Validado por Ale el 2026-07-16. Investigación previa: patrón secuencial
Quality-Value-Momentum, Magic Formula (Greenblatt), Trending Value (O'Shaughnessy).*

### 5.1 ¿Qué significa exactamente?

Dos salidas del mismo cerebro:

- La **Decisión** es el veredicto del Búnker sobre una Empresa hoy: *"¿qué haría
  contigo?"*. Por empresa, objetiva y compartida.
- El **Ranking** es la ordenación comparativa de las decisiones: *"con capital
  limitado, ¿cuál primero?"*. Entre empresas.

La Decisión sintetiza los tres conceptos previos **en secuencia** (patrón QVM
profesional, que el búnker antiguo ya seguía):

```
Calidad (gate: DESCARTAR → sin decisión de compra)
   → Valoración (potencial vs umbrales → veredicto)
      → Señal técnica (matiz de timing: tramos, tendencia)
```

**Hay UNA sola lógica de Decisión en todo el Búnker** (decisión 2026-07-16).
Las tres lógicas divergentes del sistema antiguo (Bunker con gate, Carteras sin
gate, mini búnker con regla extra) eran artefactos de implementación. Las
diferencias legítimas se expresan como parámetros, nunca como reglas por hoja.

### 5.2 ¿Qué atributos tiene?

**Decisión**:
- **Veredicto**: 🔥 GANGA · ✅ BUENA COMPRA · 🟡 RAZONABLE · ⏳ ESPERAR ·
  ⚠️ **REVISAR** (nuevo, ver abajo).
- Potencial que lo justifica + timing técnico + fecha.
- Umbrales como **parámetros con nombre** (default heredado: BUENA ≥25%,
  RAZONABLE ≥10%).
- **⚠️ REVISAR** (decisión 2026-07-16): veredicto para posiciones en cartera cuya
  Calidad se deteriora (pasa a DESCARTAR). Cierra el hueco más peligroso del
  sistema antiguo: el guardián vigilaba la puerta de entrada pero no el interior.
  REVISAR significa "mírala tú" — **nunca "vende" automático**: el Búnker opina,
  no ordena.
- **Regla extra del mini búnker eliminada** (decisión 2026-07-16): "margen ≥20%
  sin llegar a ganga fuerza ESPERAR" era una divergencia histórica ya cubierta por
  el margen de seguridad de Valoración.

**Ranking**:
- Posición + criterio de ordenación explicable en una frase: **primero el
  descuento; a igual descuento, el mejor negocio** (desempate por score de
  Calidad — decisión 2026-07-16; antes solo descuento).

### 5.3 ¿Qué NO forma parte?

- ❌ La **ejecución** — comprar/vender es del Inversor contra su tesis.
- ❌ La **presentación** (radar, iconos del bot) — ahí vive la CC-001 (icono
  🟢/❗ inerte), bug de presentación que se arregla en la planificación sin
  contaminar el dominio.
- ❌ Cualquier entrada ajena a los tres conceptos (noticias, sentimiento,
  opiniones sueltas).

### 5.4 ¿Qué la alimenta?

Solo Calidad + Valoración + Señal técnica + parámetros. El cerebro es
**determinista y auditable**: mismo dato, misma decisión.

### 5.5 ¿Quién la consume?

- **Alerta** — los cambios de veredicto son el evento alertable por excelencia.
- **Inversor** — la lee contra su tesis personal (puede discrepar; el Búnker no
  se ofende).
- **Cartera** — para posiciones existentes (promediar, revisar).

*Fuentes: [estrategia Quality-Value-Momentum](https://www.quant-investing.com/blog/quality-value-momentum-the-best-strategy-you-have-never-heard-of) ·
[combinación de factores QVM (AAII)](https://www.aaii.com/journal/article/combining-quality-growth-with-value-and-momentum) ·
[Trending Value de O'Shaughnessy](https://www.quant-investing.com/blog/how-and-why-to-implement-james-o-shaughnessy-s-trending-value-investment-strategy-world-wide)*

---

## 6. INVERSOR ✅

*Descubierto al modelar Empresa; validado por Ale el 2026-07-16. Referencia
profesional: Investment Policy Statement (CFA Institute), reducido a escala
familiar.*

### 6.1 ¿Qué significa exactamente?

Un **Inversor** es una persona que usa el Búnker: Ale, Rubén, y quien se sume
(familia/amigos). Es el concepto que separa lo **objetivo** (Empresa, datos,
Decisión — iguales para todos) de lo **subjetivo** (qué tengo, qué pienso, qué
quiero que me avisen — de cada uno).

**Transparencia** (decisión 2026-07-16): mesa compartida — **todos los Inversores
ven todo** (carteras incluidas). Al ser pocos y de confianza, no hay casilleros
privados.

### 6.2 ¿Qué atributos tiene?

**Identidad**: nombre + canal de aviso (chat de Telegram).

**Perfil** — el "IPS de bolsillo", 3 preguntas, se contesta una vez:
- **Enfoque**: dividendos / crecimiento / valor / mixto.
- **Horizonte**: años vista.
- **Nivel de ruido**: ¿solo oportunidades claras o también avisos intermedios?
  (gobierna cuántas alertas recibe por defecto).

**Relación con cada Empresa**:
- **Tesis personal**: texto libre + postura (*mantengo / vigilo / quiero ampliar*).
- **Preferencias de alerta**: silenciar avisos concretos sobre empresas concretas.

**Su Cartera** (concepto 7) — con regla de **autogestión** (decisión 2026-07-16):
cada Inversor registra él mismo sus compras y ventas conversando con el bot, sin
pasar por Ale. *(El "cómo" —comandos vs lenguaje natural con IA, Apps Script vs
VM— es decisión de implementación diferida a Fase 3; análisis preliminar: cabe en
la arquitectura actual, bot Apps Script + Gemini ya integrado, sin VM.)*

### 6.3 ¿Qué NO forma parte de Inversor?

- ❌ Los datos y decisiones del Búnker — los consume, no los altera. Silenciar
  una alerta no cambia el veredicto de la empresa.
- ❌ La Cartera en sí (posiciones, precios medios) — la *tiene*, pero es concepto aparte.
- ❌ Roles técnicos (administración del sistema) — implementación.

### 6.4 ¿Qué lo alimenta?

- **Solo Ale da de alta Inversores** (decisión 2026-07-16).
- Cada Inversor declara su perfil, sus tesis y sus operaciones (autogestión).

### 6.5 ¿Quién lo consume?

- **Alerta** — el consumidor principal: decide *a quién* enviar *qué*, filtrado
  por perfil, cartera y preferencias (fin de las alertas café para todos).
- **Cartera** — cada una pertenece a un Inversor.
- **La presentación** (bot) — cada uno pregunta por lo suyo.

*Fuente: [Elements of an IPS for Individual Investors (CFA Institute)](https://rpc.cfainstitute.org/sites/default/files/-/media/documents/article/position-paper/investment-policy-statement-individual-investors.pdf)*

---

## 7. CARTERA ✅

*Validado por Ale el 2026-07-16. Nota metodológica: la primera propuesta (registro
contable de operaciones, dividendos, TWR — el estándar de los trackers
profesionales) fue rechazada conscientemente: el Búnker es un asistente de compra,
no un contable de carteras, y un dato que depende de la disciplina de registro de
terceros es un dato muerto.*

### 7.1 ¿Qué significa exactamente?

La **Cartera** es la lista de posiciones reales de un Inversor: qué empresas tiene.
Es la frontera entre el Búnker que opina (radar, decisiones) y el dinero real.
Hay una por Inversor; todas visibles por todos (mesa compartida).

**Principio rector (decisión 2026-07-16): el Búnker no necesita datos privados de
las carteras para funcionar.** Su estructura opera con el dato mínimo (qué empresa
tiene quién); el detalle económico es opcional y de cada uno.

### 7.2 ¿Qué atributos tiene?

**Una posición = empresa + (opcional) nº de acciones y precio medio + fecha del
último cambio** (la pone el bot automáticamente).

Dos niveles de la misma estructura:
- **Nivel mínimo (obligatorio)**: "tengo esta" / "la he vendido". Un mensaje al bot
  al comprar o vender — no es contabilidad, es un aviso puntual. Si alguien ni eso,
  Ale como admin lo corrige en un minuto.
- **Nivel opcional (quien quiera; previsiblemente solo Ale)**: nº de acciones y
  precio medio → activa avisos adicionales con contexto ("estás un −12% respecto a
  tu precio medio"). Quien no lo rellene recibe las alertas estándar igualmente.

**Descartado del dominio** (decisión 2026-07-16, reabrible si el Búnker cambia de
ambición): registro de operaciones como dato primario, dividendos cobrados,
ingresos anuales, yield on cost, rentabilidad TWR y límites de concentración
(dependían de datos cuya disciplina de registro no existirá).

### 7.3 ¿Qué NO forma parte de Cartera?

- ❌ Las Decisiones sobre sus empresas — las consume, no las fabrica.
- ❌ La tesis ("por qué la tengo") — es del Inversor.
- ❌ Los precios de mercado — los usa, no los posee.
- ❌ La fiscalidad.

### 7.4 ¿Qué la alimenta?

- **Su Inversor** vía autogestión (bot): altas y bajas de posición. Nadie escribe
  en cartera ajena; Ale como administrador puede corregir cualquiera.
- **Precios de mercado** (Google Finance) para contexto — automático.

### 7.5 ¿Quién la consume?

- **Alerta** — consumidor VIP: tramos de promediar, ⚠️ REVISAR por deterioro,
  mínimos en cartera; con contexto extra para quien rellenó el nivel opcional.
- **Los Inversores** vía bot (mesa compartida).
- **La Decisión** — el veredicto ⚠️ REVISAR existe *porque* existe la posición.
