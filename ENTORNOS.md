# ENTORNOS — Producción y DEV

> ## Descubrir ≠ arreglar
>
> Lema permanente del proyecto (nacido en la Fase 0): cada fase hace SU trabajo.
> Auditar no es refactorizar. Diseñar no es programar. Migrar no es "ya que estamos…".
> Cualquier mejora detectada fuera de su fase se **registra** (incidencia, backlog,
> Open Decisions) y se ejecuta cuando le toque — nunca de pasada.

> **⚠️ DECLARACIÓN DE CONGELACIÓN (2026-07-02)**
>
> **A partir de este momento, cualquier desarrollo se realiza exclusivamente sobre el entorno DEV. Producción solo recibirá cambios mediante migraciones validadas.**

## Los dos entornos

| | PRODUCCIÓN (congelada) | DEV (trabajo) |
|---|---|---|
| Google Sheet | `Búnker de inversión` (el vivo, con el bot operando) | `[DEV] Búnker de Inversión - Auditoría` — id `1QXvGA8XWrUBe_aWL0JuM5j_hUzQz5R1PC3pL_gUYjMg` |
| Apps Script | scriptId `1zQCtxEy3X-i6mykmCP2AXvk1PXDzulf0ha4c4XSCd2m0ZwymeZnYiXEU` | scriptId `1_BffTXwUYqxjYzcjk3MxsbHHZ4p0HbYOAsQ7fdcXTF04LrMAfSc_Py_X` |
| Rama Git | `main` | `dev-v3` |
| Triggers | Los operativos (horario 08-23 + diarios) | **Ninguno** (no se copian al duplicar; no crear salvo prueba controlada) |
| Script Properties | Credenciales + estado anti-spam | **Vacías** — ⛔ NUNCA guardar aquí el `TELEGRAM_TOKEN` real |
| Telegram | Canal público + chats de Ale y Rubén | **Bloqueado por doble seguro**: sin token + flag `MODO_DEV` (archivo `00_DEV.js`, solo en rama dev-v3) |

## Reglas

1. **Producción no se toca**: ni código, ni triggers, ni properties, ni el Sheet. Solo migraciones validadas en DEV, con aprobación explícita de Ale.
2. La rama `main` refleja el código de producción. La rama `dev-v3` refleja el proyecto Apps Script DEV. No se mergea `dev-v3` → `main` hasta que una migración esté validada.
3. En DEV se pueden crear herramientas de auditoría, utilidades e informes (Fase 0B) siempre que **no alteren la lógica funcional del Búnker**.
4. Los archivos exclusivos de DEV llevan prefijo o comentario que lo indique (`00_DEV.js`, `auditoriaDEV.js`).
5. Método de despliegue a cada entorno: clasp con carpeta temporal (ver memoria del proyecto). El `.clasp.json` de DEV vive en `../Búnker DEV - Workspace/apps-script/`; el de producción se crea ad hoc y se destruye tras cada uso.

## Doble seguro de Telegram en DEV

1. **Sin credencial**: las Script Properties de DEV no tienen `TELEGRAM_TOKEN` → `ejecutarEnvio()`/`enviarPrivado()` abortan.
2. **Flag `MODO_DEV`** (rama dev-v3): las tres funciones de envío comprueban `typeof MODO_DEV !== 'undefined' && MODO_DEV` y, si está activo, **loguean el mensaje en vez de enviarlo** (permite ver qué HABRÍA enviado el bot). El `typeof` hace el guard inocuo si algún día ese código llegara a producción, donde `MODO_DEV` no existe.
