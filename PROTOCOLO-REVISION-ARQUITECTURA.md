# PROTOCOLO DE REVISIÓN DE ARQUITECTURA — Búnker 3.0

*(Artefacto oficial del proceso, al nivel de METODOLOGIA.md y los ADRs.
Origen: prompt de review de la Fase 2, refinado en tres iteraciones con
feedback metodológico de Ale, 2026-07-16. Toda revisión arquitectónica futura
—la haga Claude, ChatGPT u otra herramienta— sigue este estándar.
Primera instancia: `REVIEW-ASESOR-FASE-2.md`.)*

## 1. Principios del protocolo

1. **El revisor no es una cámara de eco**: su trabajo es cuestionar supuestos
   y encontrar debilidades, no validar por cortesía.
2. **Sin ejemplos que condicionen**: el prompt nunca ilustra la respuesta
   esperada (no se le dice al revisor cuál "debería" ser la responsabilidad de
   un concepto); las responsabilidades se deducen de los documentos.
3. **Toda crítica se fundamenta**: cada hallazgo debe apoyarse en una cita,
   relación o regla concreta de los documentos revisados. Sin impresiones
   generales. Lo no fundamentable se marca explícitamente como **HIPÓTESIS**,
   indicando qué información falta para confirmarlo.
4. **Error ≠ preferencia**: una diferencia de criterio o estilo de diseño
   nunca es bloqueante. Un hallazgo solo es 🔴 BLOQUEANTE si produce
   contradicciones, ambigüedad, pérdida de información o imposibilita la
   evolución del sistema.
5. **Arquitectura ≠ metodología de inversión**: las preguntas financieras
   (ponderaciones, parámetros, fórmulas) van en bloque aparte, marcadas como
   secundarias y mutables; no bloquean ninguna fase.
6. **Más allá del cuestionario**: el revisor debe señalar cualquier problema
   importante aunque no se le haya preguntado.
7. **Veredicto obligatorio**: la revisión termina posicionándose
   (¿cerrarías la fase? Sí/No + justificación breve).
8. Las discrepancias entre revisores (Claude ↔ asesor) no se negocian entre
   ellos: las resuelve **Ale** (METODOLOGIA.md §6).

## 2. Tareas estándar de una revisión de dominio

1. **Revisión estructural** — por concepto: separación de responsabilidades,
   cohesión (¿responsabilidad única o agrupación artificial?), conceptos que
   faltan/sobran, relaciones mal dirigidas, nombres que no representan su
   responsabilidad, contradicciones internas entre reglas.
2. **Ataque a los principios** — intentar demostrar que algún principio
   fundamental es incorrecto, insuficiente o incompatible con el resto; si no
   se consigue, decir cuál resistió peor.
3. **Deuda conceptual, extensibilidad y sustitución** — conceptos que se
   quedarán pequeños; estabilidad del modelo ante nuevos tipos de activos,
   fuentes de datos y capacidades analíticas (formulación neutral, sin inducir
   la conclusión); prueba de sustitución: si se reemplazara por completo un
   pilar (indicadores, fuentes, método de valoración), ¿qué conceptos quedan
   intactos y cuáles habría que rediseñar?
4. **Intentar romper el modelo** — conceptos ambiguos, dobles
   responsabilidades, relaciones circulares, reglas incompatibles, información
   duplicada, conceptos inmantenibles al crecer. Si no encuentra nada
   relevante, debe explicar por qué el modelo resiste.
5. **(Opcional) Bloque de metodología de inversión** — preguntas financieras
   concretas, siempre marcadas como secundarias.

## 3. Formato de salida exigido

- Hallazgos **numerados**, con **tarea de origen, concepto afectado, problema
  y propuesta**.
- Doble dimensión: **Clase** (🔴 BLOQUEANTE · 🟡 MEJORA · ⚪ OPINIÓN) ×
  **Impacto** (ALTO · MEDIO · BAJO). Lo no fundamentado, además, HIPÓTESIS.
- Sin reescribir el modelo entero; hallazgos puntuales y accionables. Lo que
  está bien se dice una sola vez.
- **Conclusión obligatoria**: "¿Cerrarías esta fase si fueras el arquitecto
  responsable? Sí/No. Explica por qué en menos de diez líneas."

## 4. Registro del resultado

Cada revisión instancia este protocolo en un archivo propio
(`REVIEW-<hito>.md`) con: el prompt exacto usado, los documentos adjuntados y
una tabla de resultado con columnas: # · Clase · Impacto · Concepto · Hallazgo
· Posición Claude · Decisión Ale.
