# REVIEW DEL ASESOR — Fase 2: Modelo de Dominio

*(Paquete preparado el 2026-07-16, según METODOLOGIA.md §6. Primera instancia
del `PROTOCOLO-REVISION-ARQUITECTURA.md` v1. **Versión FINAL — CONGELADA**
tras tres rondas de feedback (10/10 del asesor): reglas de rigor completas
—fundamentar o HIPÓTESIS, error ≠ preferencia, anti-sobreingeniería, criterio
de estabilidad, prohibido "depende"—, orden de tareas estructural→romper→
principios→deuda, y veredicto obligatorio. Pendiente tras esta primera pasada:
la segunda revisión de segundo orden, días después, según el protocolo §3.)*

## Cómo usar este paquete

1. Adjuntar al asesor estos documentos:
   - `MODELO-DOMINIO.md` (los 8 conceptos + síntesis)
   - `PLANTILLAS-ANALISIS.md` (catálogo de 10 plantillas + parámetros)
   - `INVESTIGACION-FIABILIDAD-VALORACION.md` (evidencia sobre fair value e intrínseco)
   - Opcional, como contexto: `METODOLOGIA.md`, `INVESTIGACION-ANALISIS-SECTORIAL.md`
2. Pegar el prompt de la sección siguiente tal cual.
3. Registrar los hallazgos del asesor en este mismo archivo (§ Resultado); las
   discrepancias Claude↔asesor las resuelve Ale.
4. Días después, ejecutar la **segunda revisión** (problemas de segundo orden,
   protocolo §3) y registrarla también aquí.

---

## Prompt para el asesor (primera revisión)

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

Adjunto tres documentos: el modelo de dominio (8 conceptos validados), el
catálogo de plantillas de análisis (10 plantillas por tipo de negocio) y una
investigación sobre la fiabilidad de las fuentes de valoración.

**Además de las tareas siguientes, identifica cualquier otro problema
conceptual importante aunque no te lo haya preguntado.** No te limites al
cuestionario.

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

### TAREA 1 — Revisión estructural

Para cada uno de los 8 conceptos (Empresa, Valoración, Calidad, Señal técnica,
Decisión y Ranking, Inversor, Cartera, Alerta):

1. Analiza si las **responsabilidades** de cada concepto están correctamente
   separadas. (Deduce las responsabilidades de los documentos; no te doy
   ejemplos para no condicionarte.)
2. ¿Cada concepto tiene una **responsabilidad cohesionada** o parece una
   agrupación artificial de responsabilidades distintas?
3. ¿Falta algún concepto que un sistema así necesite? ¿Sobra alguno?
4. ¿Alguna relación entre conceptos está mal dirigida o incompleta?
5. ¿Existe algún concepto cuyo **nombre no represente correctamente su
   responsabilidad**, hoy o cuando el sistema evolucione?
6. Busca **contradicciones internas**: reglas o principios del modelo que
   entren en conflicto entre sí.

### TAREA 2 — Intenta romper el modelo

No asumas que el diseño es correcto. Intenta encontrar:

- conceptos ambiguos;
- conceptos con más de una responsabilidad;
- relaciones circulares;
- reglas incompatibles;
- información duplicada;
- conceptos imposibles de mantener cuando el sistema crezca.

Si después de intentarlo no encuentras problemas relevantes, **explica por
qué** el modelo resiste.

### TAREA 3 — Ataca los principios

Intenta demostrar que alguno de los **principios fundamentales** del proyecto
(los 8 principios transversales de la síntesis, la filosofía calidad-primero,
"informa, no decide") es **incorrecto, insuficiente o incompatible** con el
resto del modelo. Si no lo consigues, di cuál resistió peor el ataque.

### TAREA 4 — Deuda conceptual, extensibilidad y sustitución

1. Señala conceptos que hoy parecen suficientes pero que probablemente
   generarán **deuda conceptual** cuando el sistema evolucione (conceptos que
   se quedarán pequeños y habrá que partir o renombrar).
2. **Evalúa la estabilidad del modelo** ante la incorporación de nuevos tipos
   de activos (opciones, ETFs, criptomonedas, fondos), nuevas fuentes de datos
   y nuevas capacidades analíticas (IA, macroeconomía): ¿qué conceptos
   tendrían que cambiar y cuánto?
3. **Prueba de sustitución**: imagina que dentro de cinco años se sustituyen
   completamente los indicadores técnicos, las fuentes de datos o el método de
   valoración. ¿Qué conceptos permanecerían intactos y cuáles deberían
   rediseñarse? Si cambian demasiados conceptos, explica por qué.

### TAREA 5 — Preguntas de metodología de inversión (secundarias)

*(Estas preguntas NO son arquitectura de dominio: son metodología de inversión
y pueden cambiar sin tocar el modelo. Respóndelas aparte y NO bloquean la fase.)*

1. **OBS-1 (doble conteo)**: el precio objetivo combina intrínseco 65% /
   InvestingPro 25% / consenso de analistas 10%, pero los modelos de
   InvestingPro usan el consenso como insumo (parte del 25% duplica el 10%).
   ¿(a) mantener 65/25/10, (b) fusionar externos en un solo peso, (c) otra?
   Argumenta con la evidencia del documento de investigación.
2. **OBS-2 (EV/Sales)**: la evidencia lo señala como el múltiplo menos fiable;
   en TECH se usa solo como contraste del DCF. ¿Defendible o ruido?
3. **Margen de seguridad manual** (10-35%, criterio humano por empresa):
   ¿fortaleza o agujero de consistencia? ¿Añadirías una guía semicuantitativa
   sin quitarle la decisión al inversor?
4. **Parámetros globales fijos** (tasa exigida 9%, crecimiento terminal 2,5%,
   caps de crecimiento): introducen sesgo uniforme cuando el entorno de tipos
   cambia. ¿Revisables con cadencia/regla, o la estabilidad vale más?
5. **Regla de síntesis del intrínseco** (media; si divergen >1,5× o uno ≤0, el
   más prudente): ¿robusta o castiga en exceso fallos técnicos de un modelo?

### FORMATO DE SALIDA

Devuelve los hallazgos **numerados** con dos dimensiones:

- **Clase**: 🔴 BLOQUEANTE (según la definición de las reglas de rigor) ·
  🟡 MEJORA (recomendación concreta, se decide en planificación) · ⚪ OPINIÓN
  (matiz discutible, decide Ale).
- **Impacto**: ALTO · MEDIO · BAJO.

Para cada hallazgo: tarea de origen, concepto afectado, problema, propuesta y
fundamento (cita/regla). Los no fundamentables, marcados además como
HIPÓTESIS. Sin reescribir el modelo entero: hallazgos puntuales y accionables.
Si algo está bien, dilo una sola vez y sin extenderte.

### CONCLUSIÓN OBLIGATORIA

Al finalizar responde obligatoriamente:

- **¿Cerrarías esta fase si fueras el arquitecto responsable? Sí / No.**
- Explica por qué en menos de diez líneas.

---

## Prompt para la segunda revisión (días después, protocolo §3)

> Asume que todos los problemas detectados en la primera revisión han sido
> resueltos. Busca ahora **problemas de segundo orden** que solo aparecen
> cuando el modelo madura. Aplican las mismas reglas de rigor, formato de
> salida y conclusión obligatoria de la primera revisión.

---

## Resultado — Primera revisión (ejecutada 2026-07-16)

**Caveat metodológico declarado por el asesor**: su sistema de archivos solo le
cargó los documentos parcialmente; declinó inventar citas de secciones no
leídas (correcto según las reglas de rigor). La 2ª revisión debe confirmar los
hallazgos sobre el texto completo.

### Hallazgos de arquitectura

| # | Clase | Impacto | Concepto | Hallazgo | Posición Claude | Decisión Ale |
|---|---|---|---|---|---|---|
| 1 | 🟡 | ALTO | Decisión y Ranking | Dos responsabilidades: ordenar (ranking) y clasificar (veredicto). Propone NO separar ahora; registrar como deuda y observar | DE ACUERDO. La unión fue deliberada (el veredicto y el orden comparten insumos); registrar deuda cuesta cero y deja el trigger claro: si evolucionan por separado, se parte | *(pendiente)* |
| 2 | 🟡 | ALTO | Empresa | Mezcla identidad permanente (cambia poco) con estado operativo radar/seleccionada/archivada (cambia siempre). Propone documentar "Estado" como candidato a independizarse | DE ACUERDO. Ritmos de cambio distintos es un criterio real de partición; hoy la simplicidad gana. Documentar como deuda | *(pendiente)* |
| 3 | 🟡 | MEDIO | Calidad | El override humano del foso mete juicio experto dentro de una evaluación automática. Propone documentarlo como "excepción consciente del modelo" | DE ACUERDO. Ya está diseñado como override trazable; añadir la etiqueta de excepción consciente es una línea en MODELO-DOMINIO.md | *(pendiente)* |
| 4 | 🟡 | MEDIO | Plantillas | Serán el punto de mayor deuda futura (nuevos activos/métodos/métricas). Propone tratarlas desde ya como "conocimiento reemplazable" | DE ACUERDO y en gran parte YA ES ASÍ: catálogo con parámetros con nombre, editable, sobrescribible. Hacer explícito el principio en PLANTILLAS-ANALISIS.md | *(pendiente)* |
| 5 | ⚪ | MEDIO | Calidad (principio) | "Calidad primero" resiste; su punto débil es operativo: Calidad es menos reproducible que Valoración (dos usuarios discreparían más) | DE ACUERDO como observación; es característica, no defecto — la mesa compartida asume UNA Calidad (la del Búnker), no una por usuario. Sin acción | *(pendiente)* |
| 6 | 🟡 | MEDIO | Dominio completo | Extensibilidad buena hacia IA/fuentes/ETFs; opciones y derivados romperían el dominio (no hay Empresa subyacente simple). El dominio está especializado en renta variable | DE ACUERDO. Es límite de alcance deliberado (la Visión analiza empresas), no deuda. Documentar el límite, sin acción | *(pendiente)* |
| 7 | ⚪ | BAJO | Principios | "Informa, no decide" es el principio mejor protegido; no consiguió romperlo | Sin acción | *(pendiente)* |
| 8 | 🟡 | BAJO | Valoración | OBS-1: no mantener 65/25/10; fusionar externos en 65% intrínseco / 35% evidencia externa (InvestingPro absorbe el consenso). Dos pesos separados aparentan una independencia estadística que no existe | DE ACUERDO con matiz: la fusión además SIMPLIFICA la regla de redistribución de ausentes (un solo peso externo). Es cambio de parámetros, no de dominio → registrarlo y aplicarlo en planificación | *(pendiente)* |

### Respuestas de metodología (Tarea 5 — no bloquean la fase)

| # | Tema | Recomendación del asesor | Posición Claude | Decisión Ale |
|---|---|---|---|---|
| M1 | OBS-1 ponderación | Fusionar: intrínseco 65% / externo 35% | DE ACUERDO (ver hallazgo 8) | *(pendiente)* |
| M2 | OBS-2 EV/Sales | Mantener exactamente como está (solo contraste) | DE ACUERDO — cierra OBS-2 sin cambios | *(pendiente)* |
| M3 | Margen de seguridad | Mantener manual + guía orientativa: incertidumbre baja 10-15% · media 20% · alta 30-35% | DE ACUERDO — es documentación, no regla; el criterio sigue siendo de Ale | *(pendiente)* |
| M4 | Parámetros globales | No recalcular automáticamente; revisión explícita anual o si el tipo libre de riesgo se mueve >X pp | DE ACUERDO — regla de gobernanza simple; fijar X en planificación (propongo 1 pp) | *(pendiente)* |
| M5 | Síntesis del prudente | Excepción: si un modelo falla por motivo técnico identificable (datos corruptos, división por cero), excluirlo ANTES de aplicar la regla del prudente | DE ACUERDO — distingue "modelo que grita barato/caro" de "modelo roto"; hoy ambos castigan igual | *(pendiente)* |

**Veredicto del asesor (1ª revisión)**: **SÍ cerraría la fase.** "Los problemas
encontrados son de evolución, no de consistencia. No hay contradicciones
fuertes, relaciones circulares peligrosas ni ambigüedades que impidan
continuar. Los ocho conceptos forman un dominio limpio: hechos (Empresa),
evaluaciones (Calidad y Valoración), síntesis (Decisión), personalización
(Inversor y Cartera) y comunicación (Alerta)."

**Posición global de Claude**: coincido con el veredicto y con los 13 puntos —
no hay discrepancia de fondo que Ale deba arbitrar, solo decisiones de
aceptar/registrar. Los hallazgos 1-7 son deuda documentable (sin tocar el
modelo); el 8/M1 y M3-M5 son cambios de metodología para la planificación.
Nota: el asesor emitió con lectura parcial de los documentos (caveat arriba);
la 2ª revisión de segundo orden servirá también de verificación completa.

## Resultado — Segunda revisión (segundo orden)

| # | Clase | Impacto | Concepto | Hallazgo | Posición Claude | Decisión Ale |
|---|---|---|---|---|---|---|
| — | — | — | — | *(pendiente)* | — | — |

**Veredicto del asesor (2ª revisión)**: *(pendiente)*
