# METODOLOGÍA DEL PROYECTO

Principios de trabajo de Búnker 3.0. Este documento existe para que el proyecto sea **autosuficiente**: no depende de la memoria de ninguna herramienta.

## 1. La fuente de verdad es la documentación del repositorio

> La memoria de las IA solo sirve para mantener continuidad entre sesiones; la fuente de verdad es siempre la documentación del repositorio.

Todo principio, decisión o regla importante debe vivir en un documento versionado (Visión, Arquitectura, ADRs, actas, este archivo). Si algo solo existe en la memoria de una IA, no existe.

## 2. La arquitectura pertenece al proyecto, no a ninguna IA

Si dentro de dos años este proyecto se trabaja con otras herramientas, la filosofía, el modelo y las reglas siguen siendo exactamente las mismas, porque están escritas aquí.

## 3. Descubrir ≠ arreglar

Lema permanente (ver también `ENTORNOS.md`). Cada fase hace SU trabajo: auditar no es refactorizar, diseñar no es programar, migrar no es "ya que estamos…". Toda mejora detectada fuera de su fase se **registra** (incidencia, backlog, Open Decisions) y se ejecuta cuando le toque.

## 4. La prueba de toda decisión

Antes de discutir cualquier decisión, hacerle una sola pregunta:

> **¿Esta decisión pertenece al dominio o pertenece a la implementación?**

- Si pertenece al **dominio** → se documenta en la Fase 2 (Modelo de Dominio).
- Si pertenece a la **implementación** → espera a las fases posteriores.

## 5. Rol de trabajo por fase

El rol con el que se trabaja cambia con la fase, y quien trabaje en el proyecto debe adoptarlo:

| Fase | Rol | Regla dura |
|---|---|---|
| 0 — Auditoría (cerrada) | Arqueólogo/auditor | Descubrir y documentar; prohibido cambiar comportamiento |
| 2 — Modelo de Dominio | **Arquitecto de dominio** | Definir el **lenguaje del Búnker**: qué entidades existen, qué representan, cómo se relacionan y qué información intercambian. **Ni una línea de código hasta que el modelo esté completo y validado.** No pensar en hojas de cálculo ni en Apps Script. |
| 3+ — Motores y migración | Ingeniero de software | Solo implementar lo definido por el dominio; migración por capas en DEV; producción solo recibe migraciones validadas |

## 6. Esquema de colaboración

- **Claude** → implementación, estructura del repositorio, auditoría, documentación técnica, desarrollo.
- **Asesor (ChatGPT)** → revisión crítica, arquitectura, metodología, cuestionar supuestos.
- Ninguno actúa como cámara de eco del otro: las discrepancias se argumentan y las resuelve **Ale**, que es quien decide siempre.

## 7. Procesos heredados (regla de la migración)

Los componentes heredados (tareas, hojas ocultas, activos no localizados) permanecen **sin modificaciones** durante la migración. Solo cuando el nuevo sistema reproduzca completamente su funcionalidad se decide si se integran, archivan o retiran. Hasta entonces son patrimonio histórico del proyecto. (Origen: respuestas PA-001/002/003 del acta de cierre de la Fase 0.)
