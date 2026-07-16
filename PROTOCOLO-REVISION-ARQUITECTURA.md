# PROTOCOLO DE REVISIÓN DE ARQUITECTURA — Búnker 3.0

**Versión 1 — CONGELADO (2026-07-16).** No se sigue refinando: cambios futuros
requieren una v2 justificada. Valorado 10/10 por el asesor tras tres
iteraciones con feedback metodológico de Ale.

*(Artefacto oficial del proceso, al nivel de METODOLOGIA.md y los ADRs. Toda
revisión arquitectónica —la haga Claude, ChatGPT u otra herramienta— sigue
este estándar. Primera instancia: `REVIEW-ASESOR-FASE-2.md`.)*

## 0. Regla de cierre de fase

> **Toda fase de arquitectura deberá superar este protocolo de revisión antes
> de darse por cerrada.** (Registrada también en METODOLOGIA.md.)

## 1. Principios del protocolo

1. **El revisor no es una cámara de eco**: su trabajo es cuestionar supuestos
   y encontrar debilidades, no validar por cortesía.
2. **Sin ejemplos que condicionen**: el prompt nunca ilustra la respuesta
   esperada ni induce conclusiones ("un buen dominio casi no cambia" está
   prohibido); las responsabilidades se deducen de los documentos.
3. **Toda crítica se fundamenta**: cada hallazgo debe apoyarse en una cita,
   relación o regla concreta de los documentos revisados. Lo no fundamentable
   se marca explícitamente como **HIPÓTESIS**, indicando qué información falta
   para confirmarlo.
4. **Error ≠ preferencia**: una diferencia de criterio o estilo nunca es
   bloqueante. Un hallazgo solo es 🔴 BLOQUEANTE si produce contradicciones,
   ambigüedad, pérdida de información o imposibilita la evolución del sistema.
5. **Contra la sobreingeniería**: el revisor no puede proponer nuevos
   conceptos, relaciones o capas salvo que el beneficio arquitectónico
   compense claramente el aumento de complejidad, y debe demostrarlo.
6. **Criterio de estabilidad**: si propone dividir un concepto, debe explicar
   también por qué la división no debería esperar a una versión futura.
7. **Prohibido el "depende"**: cuando existan varias alternativas razonables,
   el revisor debe decir cuál elegiría como arquitecto responsable y por qué.
8. **Arquitectura ≠ metodología de inversión**: las preguntas financieras
   (ponderaciones, parámetros, fórmulas) van en bloque aparte, marcadas como
   secundarias y mutables; no bloquean ninguna fase.
9. **Más allá del cuestionario**: el revisor debe señalar cualquier problema
   importante aunque no se le haya preguntado.
10. **Veredicto obligatorio**: la revisión termina posicionándose
    ("¿cerrarías la fase? Sí/No" + justificación en <10 líneas).
11. Las discrepancias entre revisores (Claude ↔ asesor) no se negocian entre
    ellos: las resuelve **Ale** (METODOLOGIA.md §6).

## 2. Tareas estándar y su orden

El orden importa: romper el modelo justo después de la revisión estructural
hace más natural el ataque posterior a los principios.

1. **Revisión estructural** — por concepto: separación de responsabilidades,
   cohesión (¿responsabilidad única o agrupación artificial?), conceptos que
   faltan/sobran, relaciones mal dirigidas, nombres que no representan su
   responsabilidad, contradicciones internas entre reglas.
2. **Intentar romper el modelo** — conceptos ambiguos, dobles
   responsabilidades, relaciones circulares, reglas incompatibles, información
   duplicada, conceptos inmantenibles al crecer. Si no encuentra nada
   relevante, debe explicar por qué el modelo resiste.
3. **Ataque a los principios** — intentar demostrar que algún principio
   fundamental es incorrecto, insuficiente o incompatible con el resto; si no
   se consigue, decir cuál resistió peor.
4. **Deuda conceptual, extensibilidad y sustitución** — conceptos que se
   quedarán pequeños; estabilidad del modelo ante nuevos tipos de activos,
   fuentes de datos y capacidades analíticas (formulación neutral); prueba de
   sustitución: si se reemplazara por completo un pilar, ¿qué conceptos quedan
   intactos y cuáles habría que rediseñar?
5. **(Opcional) Bloque de metodología de inversión** — preguntas financieras
   concretas, siempre marcadas como secundarias.

## 3. Proceso de doble revisión

Toda revisión de arquitectura se hace en **dos pasadas**:

1. **Primera revisión** — con el prompt completo de este protocolo. Crítica y
   destructiva: encuentra los problemas evidentes.
2. **Segunda revisión** — días después (no el mismo día), con un prompt
   distinto: *"Asume que todos los problemas detectados en la primera revisión
   han sido resueltos. Busca ahora problemas de segundo orden que solo
   aparecen cuando el modelo madura."* Encuentra los problemas difíciles.

## 4. Formato de salida exigido

- Hallazgos **numerados**, con **tarea de origen, concepto afectado, problema,
  propuesta y fundamento** (cita/regla).
- Doble dimensión: **Clase** (🔴 BLOQUEANTE · 🟡 MEJORA · ⚪ OPINIÓN) ×
  **Impacto** (ALTO · MEDIO · BAJO). Lo no fundamentado, además, HIPÓTESIS.
- Sin reescribir el modelo entero; hallazgos puntuales y accionables. Lo que
  está bien se dice una sola vez.
- **Conclusión obligatoria**: "¿Cerrarías esta fase si fueras el arquitecto
  responsable? Sí/No. Explica por qué en menos de diez líneas."

## 5. Backlog para una eventual v2

*(Cuarta ronda de feedback del asesor, 2026-07-16. Decisión de Ale: mantener
la v1 congelada y ejecutar la review; estas candidatas solo se incorporarán a
una v2 si la evidencia de las reviews reales muestra los defectos que
previenen — el mismo estándar de evidencia que el protocolo exige.)*

**Candidatas aceptadas como valiosas:**
1. **Autorefutación + autoverificación** (la de más valor; el asesor la
   re-propuso en la 5ª ronda con mejor redacción): "antes de mantener un
   hallazgo, intenta refutarlo con el propio contenido de los documentos; si
   encuentras evidencia en contra, descártalo o reduce su gravedad". Y bloque
   final de AUTOVERIFICACIÓN: revisar los BLOQUEANTES intentando bajarlos a
   MEJORA, revisar los conceptos marcados intentando demostrar que están bien,
   e indicar explícitamente si cambia la valoración. Control de falsos
   positivos.
1b. **Doble interpretación** (nueva, 5ª ronda): "si detectas dos
   interpretaciones razonables de un mismo fragmento, no elijas una
   arbitrariamente: expón ambas y di cuál es más consistente con el resto del
   modelo y por qué". Evita convertir ambigüedad documental en 'error del
   modelo'.
2. **Invariantes**: identificar las reglas que nunca deberían romperse aunque
   cambie la implementación, y señalar las no documentadas explícitamente.
3. **Lenguaje ubicuo (DDD)**: ¿un experto del dominio usaría espontáneamente
   estos nombres, o suenan a implementación?
4. **Valoración global numérica** (madurez/robustez/extensibilidad/claridad
   X/10 + riesgos principales), para comparar revisiones entre sí.
5. **Prueba de independencia** (menor prioridad; solapa con la de
   sustitución): si eliminas un concepto, ¿cuáles dejan de tener sentido?

**Rechazadas con motivo:**
- *Evidencia positiva obligatoria* (re-propuesta en la 5ª ronda; se mantiene
  el rechazo) — contradice "si algo está bien, dilo una sola vez" y duplica la
  longitud de la respuesta que Ale debe adjudicar.
- *Clasificación extra de priorización* — redundante: la dimensión Clase ya es
  la prioridad (🔴 antes de cerrar · 🟡 planificación · ⚪ futuro).
- *Revisión de cohesión* — ya existe (tarea estructural, pregunta 2).
- *Conceptos demasiado generales* — cubierto por deuda conceptual + nombres.
- *Separación arquitectura/negocio reforzada* — cubierto por "error ≠
  preferencia" + bloque de metodología separado.

## 6. Registro del resultado

Cada revisión instancia este protocolo en un archivo propio
(`REVIEW-<hito>.md`) con: el prompt exacto usado, los documentos adjuntados y
una tabla de resultado con columnas: # · Clase · Impacto · Concepto · Hallazgo
· Posición Claude · Decisión Ale. El veredicto de cada pasada se registra al
pie de la tabla.
