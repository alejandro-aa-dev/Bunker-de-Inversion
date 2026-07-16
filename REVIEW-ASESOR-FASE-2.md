# REVIEW DEL ASESOR — Fase 2: Modelo de Dominio

*(Paquete preparado el 2026-07-16 para la revisión crítica del asesor (ChatGPT),
según METODOLOGIA.md §6. Es el primer pendiente para cerrar la Fase 2.)*

## Cómo usar este paquete

1. Adjuntar al asesor estos documentos:
   - `MODELO-DOMINIO.md` (los 8 conceptos + síntesis)
   - `PLANTILLAS-ANALISIS.md` (catálogo de 10 plantillas + parámetros)
   - `INVESTIGACION-FIABILIDAD-VALORACION.md` (evidencia sobre fair value e intrínseco)
   - Opcional, como contexto: `METODOLOGIA.md`, `INVESTIGACION-ANALISIS-SECTORIAL.md`
2. Pegar el prompt de la sección siguiente tal cual.
3. Registrar los hallazgos del asesor en este mismo archivo (§ Resultado) o en el
   acta de cierre; las discrepancias Claude↔asesor las resuelve Ale.

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
- Filosofía: value investing, largo plazo, calidad primero ("¿merece este
  negocio mi dinero?") y precio después ("¿a qué precio?"). El sistema
  **informa, no decide**: la decisión final es siempre humana.
- Regla del proyecto: "descubrir ≠ arreglar" — señala problemas aunque no
  toque arreglarlos ahora.

Adjunto tres documentos: el modelo de dominio (8 conceptos validados), el
catálogo de plantillas de análisis (10 plantillas por tipo de negocio) y una
investigación sobre la fiabilidad de las fuentes de valoración.

### Tarea 1 — Revisión estructural del modelo

Para cada uno de los 8 conceptos (Empresa, Valoración, Calidad, Señal técnica,
Decisión y Ranking, Inversor, Cartera, Alerta):

- ¿Las **fronteras** entre conceptos son correctas y sin solapes? (p. ej.
  Valoración responde "¿qué vale?", Calidad "¿es buen negocio?", Decisión
  "¿qué hago?")
- ¿Falta algún concepto que un sistema así necesite? ¿Sobra alguno?
- ¿Alguna relación entre conceptos está mal dirigida o incompleta?

### Tarea 2 — Preguntas concretas que debes responder

1. **OBS-1 (doble conteo)**: el precio objetivo combina intrínseco 65% /
   InvestingPro 25% / consenso de analistas 10%. Pero los modelos de
   InvestingPro usan el consenso de analistas como insumo, así que parte del
   25% duplica el 10%. ¿Recomiendas: (a) mantener 65/25/10, (b) fusionar
   externos en un solo peso, (c) otra ponderación? Argumenta con la evidencia
   del documento de investigación.
2. **OBS-2 (EV/Sales)**: la evidencia (Liu, Nissim & Thomas) señala EV/Sales
   como el múltiplo menos fiable. En la plantilla TECH se usa solo como
   "contraste" del DCF. ¿Es defendible mantenerlo o introduce ruido?
3. **Margen de seguridad manual** (10-35%, criterio de Ale por empresa, nunca
   automático): ¿fortaleza (juicio humano donde el modelo es más débil) o
   agujero de consistencia (dos empresas iguales con márgenes distintos)?
   ¿Recomendarías una guía semicuantitativa sin quitarle la decisión a Ale?
4. **Parámetros globales fijos** (tasa exigida 9%, crecimiento terminal 2,5%,
   caps 15%/12%/6%/5,5%): la investigación señala que introducen sesgo
   uniforme cuando el entorno de tipos cambia. ¿Deben ser revisables con
   alguna cadencia/regla, o la estabilidad vale más que la precisión?
5. **Regla de síntesis del intrínseco** (media de modelos; si divergen >1,5× o
   uno ≤0, el más prudente): ¿es robusta o castiga en exceso a empresas donde
   un modelo falla por motivos técnicos?
6. **Veredicto ⚠️ REVISAR** (cuando los datos son contradictorios o
   insuficientes, el sistema pide revisión humana en vez de forzar un
   semáforo): ¿está bien delimitado o puede convertirse en cajón de sastre?
7. **Cartera mínima sin datos privados obligatorios** (el sistema funciona sin
   que el inversor revele importes; el detalle es opcional): ¿limita alguna
   funcionalidad esencial de un sistema de este tipo?
8. **Plantilla única por empresa derivada de GICS y sobrescribible**: ¿hay
   tipos de negocio reales que no encajen en ninguna de las 10 plantillas o
   que necesiten dos a la vez (conglomerados, empresas en transición)?

### Tarea 3 — Formato de salida

Devuelve los hallazgos **numerados y clasificados**:

- 🔴 **BLOQUEANTE** — error conceptual que debe corregirse antes de cerrar la fase.
- 🟡 **MEJORA** — recomendación concreta, puede registrarse y decidirse en planificación.
- ⚪ **OPINIÓN** — matiz discutible, para que decida Ale.

Para cada hallazgo: concepto afectado, problema, propuesta. Sin reescribir el
modelo entero: hallazgos puntuales y accionables. Si algo está bien, dilo una
sola vez y sin extenderte.

---

## Resultado de la review

*(Pendiente: registrar aquí los hallazgos del asesor, la posición de Claude en
las discrepancias, y la decisión de Ale para cada uno.)*

| # | Clase | Concepto | Hallazgo | Posición Claude | Decisión Ale |
|---|---|---|---|---|---|
| — | — | — | *(pendiente de ejecutar la review)* | — | — |
