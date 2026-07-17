# ESTADO DEL PROYECTO — Búnker de Inversión

*Leer este archivo ANTES de trabajar en cualquier sesión nueva. Mantenerlo
actualizado al cerrar cada sesión. Última actualización: **2026-07-17** (sesión tarde: paquete 2ª review listo).*

## Resumen en una línea

Fase 2 (Modelo de Dominio) terminada en borrador; bloqueada solo por la 2ª
revisión de segundo orden (no antes del **2026-07-18**) y la firma de Ale.

## Estado por fases

| Fase | Estado | Referencia |
|---|---|---|
| 0 — Auditoría | ✅ Cerrada | `ACTA-CIERRE-FASE-0.md` |
| 2 — Modelo de dominio | 🟡 Borrador, pendiente 2ª review + firma | `ACTA-CIERRE-FASE-2.md` |
| 3 — Motor / implementación | ⬜ No iniciada | M1-M5 se implementan aquí |

Producción **CONGELADA** (regla DEV-first). Working tree limpio, todo en `main`.

## PRÓXIMO PASO (camino crítico)

1. **2ª revisión de segundo orden** — Ale la lanza en ChatGPT (≥ 2026-07-18).
   Paquete LISTO en `PAQUETE-REVISION-2-FASE2.md` (2026-07-17): prompt
   autocontenido + los 3 documentos íntegros pegados como texto (NO adjuntar
   archivos; en la 1ª el asesor los cargó parcialmente). Solo copiar-pegar
   desde la marca «COPIAR DESDE AQUÍ». Claude registra el resultado en la
   tabla de `REVIEW-ASESOR-FASE-2.md` (fila espuria corregida 2026-07-17).
2. Si supera → Ale firma el acta ("sí" en chat = validación) → cerrar
   Milestone 3 de GitHub si procede.
3. **Planificación**: CC-001 (RCOLS, en DEV), CC-002 (README), CC-003 (LÉEME
   del Sheet, en DEV). M1-M5 con el motor en Fase 3.

## Documentos clave

- `METODOLOGIA.md` — roles y reglas de cierre (§7: ninguna fase de
  arquitectura cierra sin superar el protocolo).
- `PROTOCOLO-REVISION-ARQUITECTURA.md` — v1 **CONGELADO**; si el asesor
  critica el prompt, no se negocia (decisión Ale 2026-07-16). §5 = backlog v2.
- `MODELO-DOMINIO.md` — 8 conceptos + §10 deuda conceptual (NO se toca;
  descubrir ≠ arreglar).
- `PLANTILLAS-ANALISIS.md` — 10 plantillas, ponderación 65/35, gobernanza.
- `SESSION-2026-07-16-FASE2-REVIEW.md` — detalle de la última sesión.

## Reglas de proceso vigentes

- Un "sí" de Ale en chat = validación formal.
- DEV-first: nada toca producción sin pasar por DEV.
- Doble revisión de arquitectura: destructiva + segundo orden días después.
- Actualizar ESTE archivo al cerrar cada sesión.
