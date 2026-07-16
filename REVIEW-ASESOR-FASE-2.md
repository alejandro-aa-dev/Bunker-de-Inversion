# REVIEW DEL ASESOR — Fase 2: Modelo de Dominio

*(Paquete preparado el 2026-07-16 para la revisión crítica del asesor (ChatGPT),
según METODOLOGIA.md §6. Es el primer pendiente para cerrar la Fase 2.
**v2**: prompt reescrito tras el feedback metodológico de Ale — sin ejemplos que
condicionen, con tarea de "romper el modelo", contradicciones, deuda conceptual,
extensibilidad, nombres vs. responsabilidad, doble dimensión clase×impacto, y
las preguntas de metodología de inversión separadas como secundarias.)*

## Cómo usar este paquete

1. Adjuntar al asesor estos documentos:
   - `MODELO-DOMINIO.md` (los 8 conceptos + síntesis)
   - `PLANTILLAS-ANALISIS.md` (catálogo de 10 plantillas + parámetros)
   - `INVESTIGACION-FIABILIDAD-VALORACION.md` (evidencia sobre fair value e intrínseco)
   - Opcional, como contexto: `METODOLOGIA.md`, `INVESTIGACION-ANALISIS-SECTORIAL.md`
2. Pegar el prompt de la sección siguiente tal cual.
3. Registrar los hallazgos del asesor en este mismo archivo (§ Resultado); las
   discrepancias Claude↔asesor las resuelve Ale.

---

## Prompt para el asesor

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

### TAREA 1 — Revisión estructural

Para cada uno de los 8 conceptos (Empresa, Valoración, Calidad, Señal técnica,
Decisión y Ranking, Inversor, Cartera, Alerta):

1. Analiza si las **responsabilidades** de cada concepto están correctamente
   separadas. (Deduce las responsabilidades de los documentos; no te doy
   ejemplos para no condicionarte.)
2. ¿Falta algún concepto que un sistema así necesite? ¿Sobra alguno?
3. ¿Alguna relación entre conceptos está mal dirigida o incompleta?
4. ¿Existe algún concepto cuyo **nombre no represente correctamente su
   responsabilidad**, hoy o cuando el sistema evolucione?
5. Busca **contradicciones internas**: reglas o principios del modelo que
   entren en conflicto entre sí.

### TAREA 2 — Ataca los principios

Intenta demostrar que alguno de los **principios fundamentales** del proyecto
(los 8 principios transversales de la síntesis, la filosofía calidad-primero,
"informa, no decide") es **incorrecto, insuficiente o incompatible** con el
resto del modelo. Si no lo consigues, di cuál resistió peor el ataque.

### TAREA 3 — Deuda conceptual y extensibilidad

1. Señala conceptos que hoy parecen suficientes pero que probablemente
   generarán **deuda conceptual** cuando el sistema evolucione (conceptos que
   se quedarán pequeños y habrá que partir o renombrar).
2. **Prueba de extensibilidad**: si dentro de cinco años el sistema quisiera
   incorporar IA, opciones, ETFs, macroeconomía, criptomonedas o fondos,
   ¿qué conceptos del modelo tendrían que cambiar? Un buen dominio casi no
   cambia; señala los puntos donde este cambiaría más.

### TAREA 4 — Intenta romper el modelo

No asumas que el diseño es correcto. Intenta encontrar:

- conceptos ambiguos;
- conceptos con más de una responsabilidad;
- relaciones circulares;
- reglas incompatibles;
- información duplicada;
- conceptos imposibles de mantener cuando el sistema crezca.

Si después de intentarlo no encuentras problemas relevantes, **explica por
qué** el modelo resiste.

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

- **Clase**: 🔴 BLOQUEANTE (error conceptual, corregir antes de cerrar la fase)
  · 🟡 MEJORA (recomendación concreta, se decide en planificación) · ⚪ OPINIÓN
  (matiz discutible, decide Ale).
- **Impacto**: ALTO · MEDIO · BAJO.

Para cada hallazgo: tarea de origen, concepto afectado, problema, propuesta.
Sin reescribir el modelo entero: hallazgos puntuales y accionables. Si algo
está bien, dilo una sola vez y sin extenderte.

---

## Resultado de la review

*(Pendiente: registrar aquí los hallazgos del asesor, la posición de Claude en
las discrepancias, y la decisión de Ale para cada uno.)*

| # | Clase | Impacto | Concepto | Hallazgo | Posición Claude | Decisión Ale |
|---|---|---|---|---|---|---|
| — | — | — | — | *(pendiente de ejecutar la review)* | — | — |
