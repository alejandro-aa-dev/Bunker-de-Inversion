# ACTA DE CIERRE — FASE 2 (Modelo de Dominio)

```
FASE 2 — MODELO DE DOMINIO

Estado:
  BORRADOR — Pendiente de: (1) segunda revisión de segundo orden del asesor
  (protocolo §3, días después de la primera — no antes del 2026-07-18) y
  (2) validación final de Ale.

Fecha de los trabajos:  2026-07-16

Responsable del modelo:  Claude Code
Rol:  Arquitecto de dominio (METODOLOGIA.md §5)

Valida:  Ale
```

## Objetivo

Definir el **lenguaje del Búnker**: qué entidades existen, qué representan,
cómo se relacionan y qué información intercambian — sin una línea de código,
sin pensar en hojas ni en Apps Script (METODOLOGIA.md §5).

## Entregables

- ✔ **Modelo de dominio** (`MODELO-DOMINIO.md`): 8 conceptos validados por Ale
  (Empresa, Valoración, Calidad, Señal técnica, Decisión y Ranking, Inversor,
  Cartera, Alerta), cada uno con las 5 preguntas (qué es, atributos, qué NO es,
  qué lo alimenta, quién lo consume) + mapa de relaciones + 8 principios
  transversales + §10 deuda conceptual registrada.
- ✔ **Catálogo de plantillas** (`PLANTILLAS-ANALISIS.md`): 10 plantillas por
  tipo de negocio, mapeo GICS completo (cobertura total, sobrescribible),
  parámetros del motor con nombre, ponderación 65/35, reglas de gobernanza.
- ✔ **Investigación de fiabilidad** (`INVESTIGACION-FIABILIDAD-VALORACION.md`):
  evidencia sobre fair value de InvestingPro y los modelos del catálogo;
  origen de OBS-1/OBS-2 (ambas cerradas en la review).
- ✔ **Investigación sectorial** (`INVESTIGACION-ANALISIS-SECTORIAL.md`): base
  de las 10 plantillas.
- ✔ **Protocolo de revisión de arquitectura** (`PROTOCOLO-REVISION-ARQUITECTURA.md`
  v1 CONGELADO) + regla de cierre en METODOLOGIA.md §7. Subproducto de la fase
  que queda como estándar permanente del proyecto.
- ✔ **Primera revisión del asesor superada** (`REVIEW-ASESOR-FASE-2.md`):
  veredicto SÍ CERRAR, 0 bloqueantes, 13 puntos aceptados por Ale y aplicados
  (commit 92a89a1).
- ⬜ **Segunda revisión de segundo orden** — PENDIENTE (bloquea este acta).

## Decisiones clave de la fase (todas validadas por Ale, 2026-07-16)

1. **Multi-inversor**: el Búnker sirve a varios inversores (Ale, Rubén, +);
   solo Ale da de alta; mesa compartida (datos objetivos únicos, tesis y
   carteras personales).
2. **Plantilla única por Empresa** derivada del GICS, sobrescribible; catálogo
   completo por adelantado.
3. **Fuentes externas opcionales** en Valoración; ponderación fusionada
   **65% intrínseco / 35% externo** (M1; sustituye 65/25/10 y el heredado
   45/35/20 y variantes).
4. **Margen de seguridad siempre manual** por empresa, con guía orientativa
   por incertidumbre (10-15 / 20 / 30-35).
5. **Foso asistido por IA** con override humano trazable (excepción consciente
   del modelo).
6. **Veredicto ⚠️ REVISAR** para posiciones con deterioro/datos contradictorios.
7. **Alertas por transiciones, nunca estados**; resumen semanal lunes 8:00;
   silencio personal por empresa.
8. **Cartera mínima sin datos privados obligatorios**; autogestión vía bot;
   registro contable descartado conscientemente.
9. **Gobernanza de parámetros**: revisión anual o si el tipo libre de riesgo
   se mueve >1 pp (M4); exclusión de modelos con fallo técnico antes de la
   regla del prudente (M5).

## Revisiones del protocolo

| Pasada | Fecha | Veredicto | Hallazgos | Resultado |
|---|---|---|---|---|
| 1ª (destructiva) | 2026-07-16 | **SÍ cerrar** | 0 🔴 · 6 🟡 · 2 ⚪ + 5 metodológicas | 13/13 aceptados y aplicados |
| 2ª (segundo orden) | *(pendiente — no antes del 2026-07-18)* | — | — | — |

## Incidencias que pasan a la planificación (NO se tocan en Fase 2)

| Id | Origen | Descripción | Destino propuesto |
|---|---|---|---|
| CC-001 | Fase 0 | `RCOLS` desalineado con el Ranking real (DECISIÓN en índice 5, no 4) → icono 🟢/❗ inerte en el radar | Corrección en DEV al arrancar la implementación |
| CC-002 | Fase 0 | README/memoria: el paso Otras Empresas1→2 es automático por fórmula, no manual | Corrección de documentación (inmediata en planificación) |
| CC-003 | Fase 0 | LÉEME del Sheet desactualizado (celdas de control AT3:AV5, GEMINI_API_KEY, horarios) | Actualización del LÉEME en DEV |
| M1-M5 | Review Fase 2 | Ya documentadas como metodología vigente en PLANTILLAS-ANALISIS.md | Se implementan con el motor en Fase 3 (no existe código nuevo aún) |
| Deuda §10 | Review Fase 2 | 5 apuntes de deuda conceptual en MODELO-DOMINIO.md §10 | Sin acción; triggers de partición documentados |

## Firma

*(Pendiente: se completa cuando la 2ª revisión esté superada y Ale valide.
Recordatorio del proceso: un "sí" de Ale en el chat equivale a validación.)*
