# ESTADO DEL PROYECTO — Búnker de Inversión

*Leer este archivo ANTES de trabajar en cualquier sesión nueva. Mantenerlo
actualizado al cerrar cada sesión. Última actualización: **2026-08-28** (2ª
revisión ejecutada y correcciones aplicadas).*

## Resumen en una línea

Fase 2 (Modelo de Dominio) **lista para firma**: las dos revisiones del protocolo
están superadas y sus correcciones aplicadas; solo falta el "sí" de Ale.

## Estado por fases

| Fase | Estado | Referencia |
|---|---|---|
| 0 — Auditoría | ✅ Cerrada | `ACTA-CIERRE-FASE-0.md` |
| 2 — Modelo de dominio | 🟢 Lista para firma (falta validación de Ale) | `ACTA-CIERRE-FASE-2.md` |
| 3 — Motor / implementación | ⬜ No iniciada | M1-M5 se implementan aquí |

Producción **CONGELADA** (regla DEV-first). Todo en `main`.

## Qué pasó en la 2ª revisión (2026-08-28)

Veredicto del asesor: **NO cerrar, "pero por muy poco"** — 2 bloqueantes reales,
verificados contra el texto, más 6 mejoras. Arquitectura conceptual: 9,2/10.
Ale aceptó en bloque la recomendación de Claude y **ya está todo aplicado**:

- 🔴 **"En cartera" deja de ser un estado de Empresa** → condición derivada de
  `Inversor → Cartera → Empresa`. Ciclo de vida global: radar / seleccionada /
  archivada. Protege el multi-inversor (la compra privada de Rubén ya no cambia
  el estado global que ve Ale). `MODELO-DOMINIO.md` §1.2 + invariantes.
- 🔴 **Determinismo redefinido** con el estado completo (datos + versión de
  parámetros + plantilla + overrides vigentes). §5.4 + nuevo **principio 9**.
- 🟡 Aplicadas 4 precisiones: Decisión vs Ranking (§5.1), núcleo vs derivados en
  Valoración (§2.1), memoria del estado anterior en Alerta (§8.3), evidencia vs
  juicio en Calidad (§3.1).
- 📌 Deuda §10.6 (plantilla única vs conglomerados) y §10.7 (Señal técnica →
  posible "Timing"): registradas con trigger, sin tocar el modelo.
- ⚠️ Las respuestas de Tarea 5 del asesor **no aplican**: contestó sobre la
  versión antigua de la investigación (65/25/10, OBS-1/OBS-2 abiertas). La
  decisión vigente sigue siendo **65/35** (M1). De ahí sale CC-004.

**No hace falta una 3ª pasada**: el asesor puso como condición de cierre
exactamente esos dos bloqueantes, y están corregidos.

## PRÓXIMO PASO (camino crítico)

1. **Ale revisa el diff y firma el acta** ("sí" en chat = validación) → cerrar
   Milestone 3 en GitHub.
2. **Planificación**: CC-001 (RCOLS, en DEV), CC-003 (LÉEME del Sheet, en DEV),
   CC-004 (marcar OBS-1/OBS-2 como cerradas en la investigación).
   ✅ CC-002 (README) hecho 2026-07-17.
3. **Fase 3 — el motor**. Dos requisitos que nacen de esta revisión y no se
   pueden perder (REQ-F3-01 en el acta): overrides y parámetros **fechados y
   versionados**; **estado anterior persistido** para poder detectar transiciones.

## Documentos clave

- `METODOLOGIA.md` — roles y reglas de cierre (§7: ninguna fase de
  arquitectura cierra sin superar el protocolo).
- `PROTOCOLO-REVISION-ARQUITECTURA.md` — v1 **CONGELADO**; si el asesor
  critica el prompt, no se negocia (decisión Ale 2026-07-16). §5 = backlog v2.
- `MODELO-DOMINIO.md` — 8 conceptos, 9 principios, §10 deuda (7 apuntes).
- `PLANTILLAS-ANALISIS.md` — 10 plantillas, ponderación 65/35, gobernanza.
- `REVIEW-ASESOR-FASE-2.md` — las dos revisiones con hallazgos y decisiones.
- `PAQUETE-REVISION-2-FASE2.md` — el paquete enviado al asesor (histórico: refleja
  los documentos tal como estaban, no los corregidos).

## Reglas de proceso vigentes

- Un "sí" de Ale en chat = validación formal.
- DEV-first: nada toca producción sin pasar por DEV.
- Doble revisión de arquitectura: destructiva + segundo orden días después.
- Actualizar ESTE archivo al cerrar cada sesión.
