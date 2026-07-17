# PAQUETE — 2ª Revisión de segundo orden (Fase 2)

*(Preparado el 2026-07-17. Ejecutar NO ANTES del 2026-07-18, protocolo §3.
El texto del prompt está ENSAMBLADO VERBATIM desde REVIEW-ASESOR-FASE-2.md
(v1 congelada): contexto + instrucción de 2º orden + reglas de rigor +
formato + conclusión. No se ha modificado ninguna regla.)*

## Instrucciones para Ale

1. Abrir ChatGPT, chat nuevo.
2. Copiar TODO lo que hay debajo de la línea «=== COPIAR DESDE AQUÍ ===»
   y pegarlo tal cual (prompt + los 3 documentos van incluidos como texto;
   NO adjuntar archivos — en la 1ª revisión el asesor solo los cargó
   parcialmente).
3. Traer la respuesta a Claude para registrarla en REVIEW-ASESOR-FASE-2.md.

=== COPIAR DESDE AQUÍ ===

Actúas como **revisor crítico de arquitectura de dominio** de un sistema de
análisis de inversión value ("Búnker de Inversión"). No eres una cámara de eco:
tu trabajo es **cuestionar supuestos y encontrar debilidades**, no validar por
cortesía. El contexto del proyecto:

- Sistema personal (Ale + pocos inversores de confianza) sobre Google Sheets +
  Apps Script, en proceso de rediseño 3.0 por fases. Fase actual: **Modelo de
  Dominio** — solo conceptos, relaciones y reglas; la implementación llega en
  fases posteriores. **No revises implementación** (hojas, código, triggers):
  revisa el modelo conceptual.
- Filosofía: value investing, largo plazo, calidad primero y precio después.
  El sistema **informa, no decide**: la decisión final es siempre humana.
- Regla del proyecto: "descubrir ≠ arreglar" — señala problemas aunque no
  toque arreglarlos ahora.

Este modelo ya superó una primera revisión crítica. **Asume que todos los
problemas detectados en la primera revisión han sido resueltos. Busca ahora
problemas de segundo orden que solo aparecen cuando el modelo madura.**

Al final de este mensaje van pegados íntegros los tres documentos: el modelo
de dominio (8 conceptos validados), el catálogo de plantillas de análisis
(10 plantillas por tipo de negocio) y una investigación sobre la fiabilidad
de las fuentes de valoración.

### REGLAS DE RIGOR (aplican a toda la revisión)

- **Fundamenta cada crítica** con una cita, relación o regla concreta de los
  documentos. No aceptes (ni emitas) impresiones generales. Si no puedes
  fundamentar un hallazgo, clasifícalo explícitamente como **HIPÓTESIS** y
  explica qué información falta para confirmarlo.
- **No marques como BLOQUEANTE una diferencia de criterio o de estilo de
  diseño.** Un hallazgo solo será BLOQUEANTE si produce contradicciones,
  ambigüedad, pérdida de información o imposibilita la evolución del sistema.
- **No propongas nuevos conceptos, relaciones o capas** si el beneficio
  arquitectónico no compensa claramente el aumento de complejidad. Si los
  propones, demuestra ese beneficio.
- **Si propones dividir un concepto**, explica también por qué la división no
  debería esperar a una versión futura.
- **Prohibido responder "depende de preferencias"**: cuando existan varias
  alternativas razonables, explica cuál elegirías tú como arquitecto
  responsable y por qué.

### FORMATO DE SALIDA

Devuelve los hallazgos **numerados** con dos dimensiones:

- **Clase**: 🔴 BLOQUEANTE (según la definición de las reglas de rigor) ·
  🟡 MEJORA (recomendación concreta, se decide en planificación) · ⚪ OPINIÓN
  (matiz discutible, decide Ale).
- **Impacto**: ALTO · MEDIO · BAJO.

Para cada hallazgo: concepto afectado, problema, propuesta y fundamento
(cita/regla). Los no fundamentables, marcados además como HIPÓTESIS. Sin
reescribir el modelo entero: hallazgos puntuales y accionables. Si algo está
bien, dilo una sola vez y sin extenderte.

### CONCLUSIÓN OBLIGATORIA

Al finalizar responde obligatoriamente:

- **¿Cerrarías esta fase si fueras el arquitecto responsable? Sí / No.**
- Explica por qué en menos de diez líneas.



==================== DOCUMENTO: MODELO-DOMINIO.md ====================

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
| **Alerta** | ✅ Validado (2026-07-16) — mapa completo |

Catálogo de plantillas de análisis (10 plantillas + mapeo GICS): **`PLANTILLAS-ANALISIS.md`** ✅ Validado (2026-07-16).

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

---

## 8. ALERTA ✅

*Validado por Ale el 2026-07-16. Investigación previa: principios anti-fatiga de
alertas (severidad, deduplicación, contexto accionable).*

### 8.1 ¿Qué significa exactamente?

Una **Alerta** es un aviso que el Búnker envía a un Inversor porque **algo
relevante ha cambiado**. Es el único momento en que el Búnker toma la iniciativa
(push); todo lo demás es el Inversor preguntando al bot (pull). Cada alerta gasta
atención y confianza del receptor — de ahí su ley:

> **Se alerta sobre transiciones, nunca sobre estados.** "Entró HOY en zona ganga"
> es una alerta; "sigue en ganga" es ruido. Un evento → un aviso → silencio hasta
> el siguiente cambio.

### 8.2 ¿Qué atributos tiene?

**Evento origen** — catálogo cerrado de transiciones de los conceptos validados:
cambio de veredicto (→🔥/✅/⚠️…) · entrada en tramo · cruce SMA200 · mínimo nuevo
(cartera/seleccionadas) · RSI extremo · tránsito de estado de Empresa
(radar ↔ seleccionada).

**Severidad** — tres niveles:

| Nivel | Ejemplo | Comportamiento |
|---|---|---|
| 🔴 **Actúa** | ⚠️ REVISAR o tramo alcanzado en TU posición | Mensaje individual inmediato, solo al dueño |
| 🟠 **Oportunidad** | Nueva GANGA en seleccionadas | Mensaje individual a todos, filtrado por nivel de ruido |
| ⚪ **Informativa** | Tránsitos del radar, movimientos menores | Sin interrupción: va al resumen semanal |

**Enrutado** (decisiones 2026-07-16):
- **Por defecto, todo a todos** (según severidad y nivel de ruido del perfil).
- Lo específico de una posición (🔴) va **solo a su dueño**.
- **Silencio personal por empresa**: cualquier Inversor puede decir "no me avises
  más de Amazon" y deshacerlo cuando quiera; no afecta a los demás.

**Resumen semanal** — **lunes 8:00**, a todos: agrupa lo ⚪ informativo (movimientos
del radar, refresco de datos, acercamientos a zona razonable) con secciones comunes
idénticas y la sección "tu cartera" **personalizada por receptor**. *(Lunes y no
domingo: el refresco dominical de fundamentales depende de que el PC de Ale esté
encendido en algún momento del domingo — el lunes 8:00 le da margen completo.)*

**Contexto accionable**: cada alerta lleva su porqué con datos ("GANGA: cotiza 62€,
objetivo 89€, potencial +43%"), nunca un "mira la hoja".

**Horario operativo**: heredado — nada entre 00:00 y 08:00.

### 8.3 ¿Qué NO forma parte de Alerta?

- ❌ La lógica que detecta el cambio — vive en Decisión/Señal/Calidad; la Alerta
  transporta, no calcula.
- ❌ El canal (Telegram) y el formato — implementación.
- ❌ Las consultas al bot — eso es pull del Inversor, otro mecanismo.

### 8.4 ¿Qué la alimenta?

Las transiciones de Decisión, Señal técnica, Calidad y estado de Empresa + el
Inversor (perfil, cartera, silencios) para el enrutado. Nada más.

### 8.5 ¿Quién la consume?

Los Inversores, cada uno la suya. Las alertas no se archivan como conocimiento:
el conocimiento vive en los conceptos; la alerta es solo el mensajero.

*Fuentes: [alert fatigue — PagerDuty](https://www.pagerduty.com/resources/digital-operations/learn/alert-fatigue/) ·
[SRE alerting best practices](https://incident.io/blog/sre-alerting-best-practices)*

---

## 9. EL MAPA COMPLETO — síntesis

### 9.1 Relaciones entre conceptos

```
                         ┌─────────────────────────────┐
                         │          EMPRESA            │
                         │  identidad · GICS+plantilla │
                         │  estado: cartera/seleccio-  │
                         │  nada/radar/archivada       │
                         └──────┬──────────────────────┘
                                │ es el sujeto de
        ┌───────────────┬───────┴────────┬─────────────────┐
        ▼               ▼                ▼                 │
  ┌───────────┐   ┌────────────┐   ┌──────────────┐        │
  │  CALIDAD  │   │ VALORACIÓN │   │ SEÑAL TÉCNICA│        │
  │ ¿buen     │   │ ¿qué vale? │   │ ¿buen        │        │
  │ negocio?  │   │            │   │ momento?     │        │
  └─────┬─────┘   └─────┬──────┘   └──────┬───────┘        │
        │ gate          │ potencial       │ timing         │
        └───────────────┼─────────────────┘                │
                        ▼                                  │
              ┌───────────────────┐                        │
              │ DECISIÓN Y RANKING│  veredicto: 🔥✅🟡⏳⚠️  │
              │ (lógica única)    │                        │
              └─────────┬─────────┘                        │
                        │ transiciones                     │
                        ▼                                  │
              ┌───────────────────┐     enruta por         │
              │      ALERTA       │◄──────────────┐        │
              │ 🔴🟠⚪ + resumen   │               │        │
              │ semanal (lun 8h)  │               │        │
              └─────────┬─────────┘               │        │
                        ▼                         │        │
              ┌───────────────────┐    ┌──────────┴─────┐  │
              │     INVERSOR      │───►│    CARTERA     │──┘
              │ perfil · tesis ·  │ 1:1│ posiciones     │ contiene
              │ silencios         │    │ (detalle opc.) │ empresas
              └───────────────────┘    └────────────────┘
```

### 9.2 La respuesta a la pregunta fundacional

**¿Qué sabe el Búnker sobre una empresa?** Sabe:

1. **Quién es** (Empresa: identidad, sector, cómo hay que analizarla).
2. **Si es un buen negocio** (Calidad: rentabilidad, balance, trayectoria, foso).
3. **Cuánto vale** (Valoración: intrínseco → objetivo → precio de entrada → potencial).
4. **Si es buen momento** (Señal técnica: tendencia, temperatura, extremos, tramos).
5. **Qué haría con ella** (Decisión y Ranking: veredicto y prioridad).
6. **A quién le importa** (Inversor y Cartera: quién la tiene, quién la sigue, tesis).
7. **Cuándo avisar** (Alerta: transiciones relevantes, a la persona correcta).

### 9.3 Principios transversales del modelo (emergidos durante la Fase 2)

1. **Objetivo vs. subjetivo**: los datos, señales y decisiones son únicos y
   compartidos; las tesis, preferencias y carteras son de cada Inversor.
2. **Parámetros con nombre**: ninguna constante enterrada en fórmulas; todo umbral
   es un parámetro visible, con default global y ajuste por plantilla.
3. **Plantillas por sector**: qué métricas y modelos aplican lo decide la plantilla
   (derivada del GICS, sobrescribible por empresa).
4. **Ley de subordinación técnica**: la técnica nunca elige la empresa, solo el momento.
5. **Ley de transiciones**: se alerta del cambio, jamás se repite el estado.
6. **Lógica única**: una sola Decisión para todo el Búnker; sin réplicas divergentes.
7. **El Búnker opina, no ordena**: la ejecución es siempre humana.
8. **Automático primero**: ningún dato del modelo depende de la disciplina de
   registro de terceros; lo manual es opcional (detalle de cartera) o puntual y
   asistido (foso).

---

## 10. DEUDA CONCEPTUAL REGISTRADA

*(Origen: primera revisión del asesor según PROTOCOLO-REVISION-ARQUITECTURA.md,
2026-07-16 — veredicto: cerrar la fase. Hallazgos aceptados por Ale ("sí a
todo"). Son observaciones de evolución, NO cambios: el modelo queda como está
y estos apuntes marcan dónde partirlo si algún día crece. Detalle completo en
REVIEW-ASESOR-FASE-2.md.)*

1. **Decisión y Ranking tiene dos responsabilidades latentes**: clasificar
   (veredicto) y ordenar (prioridad). Conviven bien porque comparten insumos.
   *Trigger de partición*: si en el futuro evolucionan por separado (p. ej.
   rankings alternativos sobre los mismos veredictos), se dividen.
2. **Empresa mezcla identidad (casi inmutable) con estado operativo
   (radar/seleccionada/archivada, cambia continuamente)**. Ritmos de cambio
   distintos. *Candidato a independizarse*: el Estado, si el ciclo de vida se
   enriquece (más estados, más transiciones, historial).
3. **El override humano del foso es una EXCEPCIÓN CONSCIENTE del modelo**:
   introduce juicio experto dentro de una evaluación por lo demás automática.
   Se acepta porque el foso es la dimensión donde el juicio humano supera a las
   métricas; la mitigación es su trazabilidad (queda registrado quién y cuándo).
4. **El dominio está especializado en renta variable** (empresas cotizadas).
   ETFs, fondos, nuevas fuentes o IA encajarían con cambios menores; opciones y
   derivados NO caben sin rediseño (no hay "Empresa" como subyacente simple).
   Es un límite de alcance deliberado, coherente con la Visión, no una carencia.
5. **Calidad es el concepto menos reproducible** (por el juicio del foso):
   dos analistas discreparían más en Calidad que en Valoración. Característica
   asumida, no defecto: en la mesa compartida existe UNA Calidad, la del Búnker.


==================== DOCUMENTO: PLANTILLAS-ANALISIS.md ====================

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
  **Guía orientativa** (decisión M3 de la review del asesor, 2026-07-16 — es
  guía, nunca regla; la decisión sigue siendo humana): incertidumbre baja →
  10-15% · media → 20% · alta → 30-35%.
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

**Ponderación vigente (2026-07-16, decisión M1 de la review del asesor —
sustituye al 65/25/10 del mismo día), parámetro global único:**

```
PESO_INTRINSECO = 65% · PESO_EXTERNO = 35%
```

- **Las fuentes externas se fusionan en un solo peso** (InvestingPro absorbe al
  consenso de analistas): mantener dos pesos separados aparentaba una
  independencia estadística que no existe — los modelos de InvestingPro usan el
  consenso como insumo (OBS-1, INVESTIGACION-FIABILIDAD-VALORACION.md).
- Dentro del 35%: media de las fuentes externas disponibles (si están las dos);
  si solo hay una, ella sola es el 35%.
- Uniforme para todas las plantillas (ajustable por plantilla si algún día hace falta).
- Externos ausentes → su peso se redistribuye al intrínseco (hasta 100% intrínseco).
  La fusión simplifica esta regla: un único peso externo que existe o no existe.

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
| PESO_INTRINSECO / EXTERNO | 65/35 | §2 (fusión M1, review 2026-07-16) |
| UMBRAL_BUENA_COMPRA / RAZONABLE | 25% / 10% | Veredicto (Decisión) |
| TRAMOS_TECNICOS | 0/−10/−20% vs SMA200 | Señal técnica |

*(El catálogo completo de parámetros, incluidos los de TECH/FARMA/TELECOM que no
existían, se cerrará en el documento de parámetros de la planificación de Fase 3.)*

**Reglas de gobernanza** (decisiones M4/M5 de la review del asesor, 2026-07-16):

- **Revisión de parámetros** (M4): los parámetros globales NO se recalculan
  automáticamente; se revisan explícitamente **una vez al año o cuando el tipo
  libre de riesgo se mueva más de 1 punto porcentual** desde la última revisión.
  Cambiarlos es siempre decisión de Ale.
- **Excepción a la regla del prudente** (M5): si un modelo de valoración falla
  por motivo **técnico identificable** (dato corrupto, división por cero, insumo
  ausente), se **excluye de la síntesis** antes de aplicar la regla del prudente.
  La regla castiga discrepancias de opinión entre modelos, no averías.

**Principio del catálogo** (hallazgo 4 de la review, 2026-07-16): las plantillas
son **conocimiento reemplazable** — el componente del dominio que más cambiará
con los años (nuevos métodos, nuevas métricas). El resto del modelo no debe
acoplarse a su contenido: solo a que "toda Empresa tiene una plantilla que
activa modelos y umbrales".


==================== DOCUMENTO: INVESTIGACION-FIABILIDAD-VALORACION.md ====================

# INVESTIGACIÓN — Fiabilidad del Fair Value de InvestingPro y del valor intrínseco del catálogo

*(Fase 2 — Modelo de Dominio. Investigación solicitada por Ale el 2026-07-16,
previa a la review del asesor. Complementa PLANTILLAS-ANALISIS.md §2
—ponderación 65/25/10— y MODELO-DOMINIO.md §2 Valoración.)*

## 0. Conclusión ejecutiva

**Ni el Fair Value de InvestingPro ni nuestro valor intrínseco son fiables como
predictor puntual del precio a 1 año.** La evidencia empírica dice que los
valores razonables funcionan como herramienta de **ranking relativo a largo
plazo** —exactamente el uso que les da el Búnker (Ranking + margen de seguridad
manual)—, no como pronóstico de precio a 12 meses.

Hallazgos accionables (registrados como observaciones, NO aplicados —
descubrir ≠ arreglar):

- **OBS-1 — Doble conteo parcial de analistas**: los modelos de InvestingPro
  usan estimaciones de consenso de analistas como insumo, así que una fracción
  del 25% de PESO_INVESTINGPRO "son" analistas otra vez (además del 10% de
  PESO_ANALISTAS). El 65/25/10 sigue siendo defendible (el promediado de 15+
  modelos diluye el sesgo), pero el asesor debería opinar.
- **OBS-2 — EV/Sales es el múltiplo menos fiable** según la evidencia (Liu,
  Nissim & Thomas). Correcto como *contraste* en la plantilla TECH; nunca
  debería entrar en la síntesis del intrínseco con peso propio.

## 1. Fair Value de InvestingPro

### 1.1 Qué es realmente

- Compuesto de **~15-17 modelos** promediados: variantes de DCF (p. ej. 5Y DCF
  Revenue Exit), múltiplos (EV/EBITDA, EV/EBIT, EV/Sales), DDM multi-etapa,
  EPV, comparables. Datos de S&P Global Market Intelligence.
- **Insumo clave: estimaciones de consenso de analistas** (crecimientos,
  beneficios futuros). No es independiente de los analistas.
- **No publican**: ponderaciones entre modelos, horizonte temporal explícito,
  ni metodología detallada de combinación.
- Ellos mismos reconocen que la fiabilidad **cae en small caps** y que el Fair
  Value es una "segunda opinión estructurada", no una predicción.

### 1.2 Evidencia de fiabilidad: prácticamente ninguna independiente

- Lo único publicado son **casos de éxito del propio Investing.com** ("Fair
  Value predijo la caída del 43% de NextDecade", "68% de retorno en LiveRamp").
  Sesgo de selección puro: publican aciertos, nunca la tasa de acierto.
  **No existe backtest independiente publicado.** Esa ausencia es en sí un dato.
- El análogo mejor estudiado es **Morningstar** (mismo concepto: fair value
  compuesto por modelos): la evidencia disponible indica que sus estimaciones
  **ordenan bien grupos de acciones en términos relativos, pero no predicen el
  resultado absoluto de una acción concreta**, y la convergencia precio→fair
  value la esperan a **~3 años, no a 1**.
- La evidencia académica más sólida sobre valores intrínsecos compuestos
  (Frankel & Lee 1998: ratio V/P con renta residual + estimaciones de
  analistas) encuentra **predicción modesta de retornos relativos, sobre todo a
  horizontes largos**; a 12 meses su poder es comparable al simple
  book-to-price.
- Al alimentarse de consenso, InvestingPro **hereda parte del sesgo optimista
  (+9,4%)** ya documentado en PLANTILLAS-ANALISIS.md §2 → OBS-1.

### 1.3 Veredicto

Merece su 25% como segunda opinión diversificada (promediar 15+ modelos > un
número de consenso), pero sin evidencia independiente de precisión y con
contaminación parcial de analistas. **Nunca por encima del intrínseco.**

## 2. Valor intrínseco — los 8 modelos del catálogo

Contexto teórico: DDM, DCF y renta residual son **matemáticamente
equivalentes**; las diferencias empíricas vienen de la implementación, y el
**valor terminal domina el resultado** (Lundholm & O'Keefe; Courteau et al.).
Traducción al Búnker: los parámetros con nombre (TASA_EXIGIDA 9%,
CRECIMIENTO_TERMINAL 2,5%, caps) son los que realmente deciden el número.

| Modelo (plantilla) | Qué dice la evidencia | Lectura para el Búnker |
|---|---|---|
| P/BV justo = (ROE−g)/(r−g) (BANCO/SEGURO) | Es un modelo de renta residual: **el enfoque con mejor precisión empírica** (Penman & Sougiannis 1998; Francis, Olsson & Oswald 2000; Courteau 2001) | Nuestro modelo mejor respaldado |
| DCF 2 fases (COMP, TECH, FARMA) | Máxima sensibilidad a supuestos: ±1 pp en r o g terminal mueve el valor 20-40% | Parámetros fijos reducen ruido entre empresas pero introducen sesgo uniforme: cuando el 9% esté "mal" vs. el entorno de tipos, lo estará para todas a la vez |
| Fórmula de Graham (COMP) | El propio Graham advirtió que **no da el "valor verdadero"**, era ilustrativa, y "las proyecciones de crecimiento nunca son fiables" | El cap del 12% mitiga su mayor debilidad (hipersensibilidad a g). Correcta solo promediada con DCF + regla del prudente |
| Múltiplos: EV/EBITDA mid-cycle (CICL), P/AFFO (REIT), EV/EBITDA comparable (TELECOM) | Liu, Nissim & Thomas 2002: múltiplos sobre **beneficios forward** explican precios notablemente bien (error <15% en la mitad de la muestra). Ranking: forward > históricos > cash flow ≈ book value > **ventas (el peor)** | Razonables. Preferir métricas forward/normalizadas cuando existan |
| EV/Sales (contraste TECH) | El múltiplo **menos fiable** de todos según la misma evidencia | OBS-2: bien como contraste, jamás con peso en la síntesis |
| DDM (UTIL) | Equivalente en teoría; en la práctica depende críticamente de g y r | Cap 5,5% correcto; solo para dividenderas estables (como está diseñado) |
| NAV y NAV×(1−descuento) (REIT, HOLDING) | Sin estudio directo en lo revisado; ancla en activos, menos dependiente de proyecciones | Riesgo desplazado a la calidad del NAV reportado y del descuento histórico |

## 3. Implicaciones para el diseño (validadas por la evidencia)

1. **El diseño ya apunta en la dirección correcta**: la Valoración se usa para
   ordenar (Ranking) y fijar precios de entrada con margen de seguridad manual
   del 10-35% — la mitigación clásica contra la imprecisión del punto estimado.
   No se usa como predicción a 12 meses. Mantener así.
2. **PESO_INTRINSECO = 65% queda reforzado**: la fuente con mejor evidencia
   empírica es la interna (renta residual, múltiplos forward), no la externa.
3. **Pendiente para la review del asesor**: OBS-1 (doble conteo) y OBS-2
   (EV/Sales). Sin cambios en PLANTILLAS-ANALISIS.md hasta decisión de Ale.

## Fuentes

**InvestingPro / fair value compuesto**
- [Cómo calcula InvestingPro el fair value (Investing.com Academy)](https://www.investing.com/academy/analysis/fair-value-investing-stocks/)
- [Review independiente de InvestingPro (The Stock Dork)](https://www.thestockdork.com/investingpro-review/)
- [Ejemplo de caso de éxito auto-publicado (LiveRamp)](https://www.investing.com/news/investment-ideas/investingpro-fair-value-nails-68-return-on-liveramp-in-5-months-93CH-4792930)
- [Morningstar — metodología de equity research (convergencia ~3 años)](https://www.morningstar.com/content/dam/marketing/shared/research/methodology/705988Morningstar_Equity_Research_Methodology.pdf)

**Precisión de modelos de valoración**
- [Penman & Sougiannis — comparación empírica cash flow vs. accrual](https://business.columbia.edu/sites/default/files-efs/pubfiles/1068/Penman_On_comparing_Cash_Flow_and_Accrual_Accounting_Models.pdf)
- [Francis, Olsson & Oswald — precisión DDM/DCF/renta residual](https://www.researchgate.net/publication/275267264_Comparing_the_Accuracy_and_Explainability_of_Dividend_Free_Cash_Flow_and_Abnormal_Earnings_Equity_Value_Estimates)
- [Lundholm & O'Keefe — equivalencia teórica y errores de implementación](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=288959)
- [Liu, Nissim & Thomas — precisión de múltiplos](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=241266)
- [Fórmula de Graham — advertencias del propio Graham (GrahamValue)](https://www.grahamvalue.com/article/understanding-benjamin-graham-formula-correctly)
- [Benjamin Graham formula (Wikipedia)](https://en.wikipedia.org/wiki/Benjamin_Graham_formula)
- [Frankel & Lee — V/P y retornos a largo plazo](https://www.sciencedirect.com/science/article/pii/S0165410198000263)

**Ya citadas en PLANTILLAS-ANALISIS.md §2 (fiabilidad de price targets)**
- [Accuracy multi-dimensional de price targets](https://www.sciencedirect.com/science/article/abs/pii/S1059056024000960)
- [18 años de datos (Anachart)](https://anachart.com/how-accurate-are-analyst-price-targets/)
- [Habilidad diferencial de analistas](http://assets.csom.umn.edu/assets/37727.pdf)
