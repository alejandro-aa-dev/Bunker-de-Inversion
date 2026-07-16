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
| Valoración | ⏳ En pizarra |
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

## 2. INVERSOR 🔎 (descubierto — pendiente de pizarra)

Concepto emergido al modelar Empresa (2026-07-16): las personas del Búnker
(Ale, Rubén, ampliable a familia/amigos). Apuntes acordados, pendientes de las 5 preguntas:

- Cada Inversor tiene **su propia Cartera**.
- La relación Inversor↔Empresa contiene lo **subjetivo**: tesis personal
  ("para mí está cara pero él la entiende y la mantiene"), perfil con que la ve
  (dividendera / crecimiento / valor…) y **preferencias de alertas** (silenciar
  avisos concretos sobre empresas concretas).
- La Empresa y sus datos siguen siendo objetivos y compartidos.
