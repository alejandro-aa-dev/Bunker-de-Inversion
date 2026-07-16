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
| **Inversor** | 🔎 Descubierto al modelar Empresa — pendiente de pizarra |
| **Valoración** | ✅ Validado (2026-07-16) |
| **Calidad** | ✅ Validado (2026-07-16) |
| **Señal técnica** | ✅ Validado (2026-07-16) |
| Ranking / Decisión | Pendiente |
| Cartera | Pendiente (ahora es *por Inversor*) |
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

## 5. INVERSOR 🔎 (descubierto — pendiente de pizarra)

Concepto emergido al modelar Empresa (2026-07-16): las personas del Búnker
(Ale, Rubén, ampliable a familia/amigos). Apuntes acordados, pendientes de las 5 preguntas:

- Cada Inversor tiene **su propia Cartera**.
- La relación Inversor↔Empresa contiene lo **subjetivo**: tesis personal
  ("para mí está cara pero él la entiende y la mantiene"), perfil con que la ve
  (dividendera / crecimiento / valor…) y **preferencias de alertas** (silenciar
  avisos concretos sobre empresas concretas).
- La Empresa y sus datos siguen siendo objetivos y compartidos.
