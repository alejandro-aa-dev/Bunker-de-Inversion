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
| Calidad | Pendiente |
| Señal técnica | Pendiente |
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

## 3. INVERSOR 🔎 (descubierto — pendiente de pizarra)

Concepto emergido al modelar Empresa (2026-07-16): las personas del Búnker
(Ale, Rubén, ampliable a familia/amigos). Apuntes acordados, pendientes de las 5 preguntas:

- Cada Inversor tiene **su propia Cartera**.
- La relación Inversor↔Empresa contiene lo **subjetivo**: tesis personal
  ("para mí está cara pero él la entiende y la mantiene"), perfil con que la ve
  (dividendera / crecimiento / valor…) y **preferencias de alertas** (silenciar
  avisos concretos sobre empresas concretas).
- La Empresa y sus datos siguen siendo objetivos y compartidos.
