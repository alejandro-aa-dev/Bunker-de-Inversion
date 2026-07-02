# AUDITORÍA FASE 0 — Estado actual del Búnker de Inversión (v2.0)

**Fecha**: 2026-07-02
**Auditor**: Claude Code (rol: arqueólogo del software)
**Regla de oro**: Descubre. Documenta. Registra. NO cambies.

---

## 0. Método y alcance

- **Fuente auditada**: los 6 archivos `.js` + `appsscript.json` de este repositorio.
- **Verificación de producción**: el 2026-07-02 se hizo `clasp pull` del proyecto de producción (scriptId `1zQCtxEy3X-...eZnYiXEU`, container-bound al Google Sheet) y se comparó archivo a archivo con el repositorio: **los 7 archivos son idénticos**. Lo que se documenta aquí es exactamente lo que se ejecuta.
- **Fuera de alcance de esta parte (Parte A)**: el interior del Google Sheet (fórmulas de las hojas, los 7 modelos de valoración, el semáforo, los filtros de "Otras Empresas1"). Ver §13 — Pendiente de auditar.
- Durante la auditoría **no se ha modificado ni una línea** de código ni de datos.

---

## 1. Inventario de componentes

| Archivo | Líneas | Rol | Estado |
|---|---|---|---|
| `ALERTAS DE INVERSIÓN UNIFICADAS.js` | 514 | Circuito PÚBLICO (radar, cambio de condición, recordatorios) + análisis IA + envío al canal | Activo |
| `alertasIntradiaPrivadas.js` | 1051 | Circuito PRIVADO: BLOQUES 1-5 + horario operativo + motor RSI | Activo |
| `alertasPromediarSMA200.js` | 164 | Circuito PRIVADO: promediar a la baja + `enviarPrivado()` (usado por todo el circuito privado) | Activo |
| `enviarTelegram.js` | 33 | Helper genérico de envío | **Huérfano** — definido, nunca llamado |
| `guardarTokenTelegram.js` | 4 | Setup one-shot del token | Utilidad de instalación |
| `testTelegram.js` | 38 | Diagnóstico de conexión Telegram | Utilidad de diagnóstico |
| `appsscript.json` | — | Manifest: TZ `Europe/Madrid`, runtime V8, logging Stackdriver | Activo |

**Nota estructural**: en Apps Script los `.js` viven dentro de una carpeta `Búnker de Inversión/`; en el repo están en la raíz. No hay módulos: todos los archivos comparten el scope global (ver §10.5).

---

## 2. Hojas del Google Sheet y su propósito

| Hoja | Propósito | Quién escribe | Quién lee (código) |
|---|---|---|---|
| `Bunker de inversion USA` | Universo valorado USA (precios, decisión, descuentos) + celdas de control | Fórmulas de la hoja + script (U, V, R, AI4, AJ4, AK4, AL4) | Radar, condición, recordatorios, BLOQUE 2, mapas de divisa/precio |
| `Bunker de inversion exUSA` | Ídem para no-USA | Ídem | Ídem |
| `Ranking USA` / `Ranking exUSA` | Orden por descuento; alimenta el radar | Fórmulas de la hoja | `obtenerRanking()` |
| `Alertas SMA200` | **Cartera de Ale y Rubén** — layout A-Q | Fórmulas (A-M) + script (I, J, N-Q) | BLOQUES 1, 3, 4, 5 y promediar |
| `Otras Empresas1` | Mini búnker pasos 1-2 (filtro calidad 2 capas + valoración 7 modelos). **Sin conexión con el bot** | Usuario + fórmulas | Nadie (código) |
| `Otras Empresas2` | Mini búnker paso 3: filtradas — layout A-Q idéntico a la cartera | Fórmulas + script (N-Q) | BLOQUE 4 (RSI) |
| `_scratchRSI` | Oculta — fórmulas `GOOGLEFINANCE` persistentes (bloque de 3 columnas por ticker) con ~365 días de cierres | Script (estructura) + GOOGLEFINANCE (datos) | `calcularRSI()`, BLOQUE 5 |

⚠️ Historial documentado (memoria 2026-06-18): las tres hojas `Alertas SMA200`, `Otras Empresas1` y `Otras Empresas2` **existen y son distintas**; una confusión de nombres provocó en su día una configuración incorrecta de `HOJAS_RSI`, ya corregida.

---

## 3. Diccionario de datos

### 3.1. Hojas "Bunker de inversion *" (constantes `BCOLS` y `CFG_INTRA.B_*`; datos desde fila 2)

| Col | Campo | Tipo | Fuente | Actualización | Propósito | Quién lo consume |
|---|---|---|---|---|---|---|
| B | Nombre | texto | Hoja | Manual/fórmula | Presentación | Todos los mensajes |
| C | Ticker | texto | Hoja | Manual | Clave de cruce (se normaliza a MAYÚS) | Todo |
| E | Decisión | texto+emoji | Fórmula de la hoja (semáforo de valoración; incluye icono 🟢/❗ del filtro) | Recalculo de la hoja | **Indicador maestro** del circuito de valoración | `esEstadoAlerta()`, `_detectarEstado_()`, `iconoFiltro()` |
| G | Precio actual | número | Fórmula (GOOGLEFINANCE, se asume) | En vivo | Dato base | Radar, alertas, `_mapaPrecios_()` (fallback de precio para el circuito privado) |
| L | Precio ganga | número | Fórmula (modelo de valoración con margen) | Recalculo | Umbral de ganga | Radar, alertas, recordatorios |
| N | Descuento sin margen | fracción (0.15 = 15%) | Fórmula | Recalculo | Métrica de presentación | `formatPct()` |
| O | Descuento con margen | fracción | Fórmula | Recalculo | Filtro del radar (>0) + presentación | Radar, alertas |
| Q | Puesto en ranking | número | Fórmula | Recalculo | Presentación + filtro de recordatorios (≥1) | Radar, recordatorios |
| R | Fecha última Compra Ganga | fecha | **Script** (`_enviarRecordatorio`) | Al enviar recordatorio | Enfriamiento de 3 días por empresa | Recordatorios |
| U | Estado notificado | texto | **Script** (`comprobarAlertasIndividuales`) | Al enviar alerta | Anti-repetición (mismo estado no se reavisa) | Alertas de condición |
| V | Fecha última notificación | fecha | **Script** | Al enviar alerta | Enfriamiento de 1 hora | Alertas de condición |

**Celdas de control** (solo se escriben en `...USA`, salvo AI4 que se marca en ambas):

| Celda | Contenido | Propósito |
|---|---|---|
| AI4 | Fecha `dd/MM/yyyy` | Radar diario: no repetir el mismo día |
| AJ4 | Contador (0/1) | Recordatorios: máx. 1 por hoja y día |
| AK4 | Fecha | Reset diario del contador AJ4 |
| AL4 | Fecha (solo hoja USA) | Recordatorio semanal: no repetir el mismo lunes |

### 3.2. Hojas "Ranking *" (constantes `RCOLS`; datos desde fila 2)

| Col | Campo | Uso en código |
|---|---|---|
| A | Puesto | Filtro top-5 y ordenación |
| B | Nombre | Presentación |
| C | Ticker | Cruce con hoja Bunker |
| D | Potencial | Leído en el rango pero **no usado** |
| E | Decisión | Icono de filtro en el radar |
| G | Margen | Leído en el rango pero **no usado** |

### 3.3. Layout A-Q (compartido por `Alertas SMA200` y `Otras Empresas2`; fila 1 = título, fila 2 = cabeceras, datos desde fila 3)

| Col | Campo | Tipo | Fuente | Consumidor |
|---|---|---|---|---|
| A | Acción (nombre) | texto | Manual | Mensajes |
| B | Ticker | texto | Manual | Todo (clave) |
| C | Precio | número | Fórmula (GOOGLEFINANCE); si no resuelve, el código usa el precio de las hojas Bunker como fallback | B1, B4, B5, promediar |
| D | SMA200 | número | Fórmula | B4 (tendencia de fondo), promediar |
| E | Distancia a SMA200 | fracción | Fórmula | Promediar (presentación) |
| F | Alerta | texto | Fórmula | Nadie (código) — **pendiente confirmar en el Sheet** |
| G | Semáforo | texto | Fórmula (valoración embebida) | Promediar (presentación) |
| H | Señal / Tramo | texto | Fórmula | Promediar (**disparador** de la alerta) |
| I | Estado avisado | texto | **Script** (promediar) | Anti-spam por cambio de tramo |
| J | Fecha aviso | fecha | **Script** (promediar) | Registro (no se lee para lógica) |
| K | Var% día | % ya multiplicado (−5 = −5%) | Fórmula | B1, B4 (presentación) |
| L | Var% semana | % | Fórmula | B3 |
| M | Var% mes | % | Fórmula | B3 |
| N | RSI | número | **Script** (B4) | Presentación en hoja |
| O | Estado RSI | NORMAL/SOBREVENTA/SOBRECOMPRA | **Script** (B4) | **Estado previo** para detectar transición |
| P | Fecha RSI | texto `dd/MM HH:mm` | **Script** (B4) | Registro |
| Q | Última señal | texto | **Script** (B4) | Presentación (se conserva si no hay transición) |

⚠️ Nota de unidades: los descuentos de Bunker (N/O) son **fracciones** (`formatPct` multiplica ×100); las variaciones K/L/M ya vienen **en puntos porcentuales**. Dos convenciones distintas conviviendo (ver §10.7).

### 3.4. Hoja `_scratchRSI` (estructura por bloque de 3 columnas)

| Fila | Contenido |
|---|---|
| 1 (col base) | Ticker (etiqueta de índice) |
| 2 (col base) | Fórmula `=GOOGLEFINANCE("<ticker>";"close";TODAY()-365;TODAY())` — cabecera Date/Close |
| 3+ | Datos: col base = fecha, col base+1 = cierre |

- Indexada por **ticker**, no por hoja: un ticker en cartera y en mini búnker comparte bloque.
- Fórmulas **persistentes** a propósito: una fórmula escrita por script no se resuelve en la misma ejecución, así que se dejan vivas y se leen ya calculadas en la siguiente.
- Se reescribe la fórmula si falta, si está en `#ERROR`/`#N/A`, o si el horizonte configurado cambió.
- Los cierres ≤ 0 se descartan al leer (GOOGLEFINANCE a veces cuela ceros).

### 3.5. Script Properties (estado + credenciales)

| Clave | Tipo | Escrita por | Propósito |
|---|---|---|---|
| `TELEGRAM_TOKEN` | credencial | `guardarTokenTelegram()` (manual) | Bot API |
| `GROQ_API_KEY1` | credencial | Manual | Análisis IA |
| `GROQ_CACHE_<ticker>` | JSON `{text, ts}` | `obtenerAnalisisGemini()` | Caché 24 h del análisis |
| `INTRA_CAIDA_<t>` / `INTRA_SUBIDA_<t>` | número (escalón) | B1 | Escalón diario ya avisado; reset al cruzar el umbral de reset |
| `SEMANAL_CAIDA/SUBIDA_<t>`, `MENSUAL_CAIDA/SUBIDA_<t>` | número | B3 | Ídem semanal/mensual |
| `INTRA_VALOR_<t>` | `GANGA`/`BUENA`/`RAZONABLE` | B2 | Nivel de compra ya avisado (solo avisa si sube de nivel) |
| `INTRA_VALOR_TS_<t>` | timestamp ms | B2 | Cooldown 4 h |
| `RSI_ALERT_<hoja>_<t>` | timestamp ms | B4 | Cooldown 2 h por hoja+ticker |
| `MINIMO_DIA_<t>` | `yyyyMMdd` | B5 | Máx. 1 aviso de mínimo por ticker y día natural |
| `RSI_SEP_FORMULA` | `;` o `,` | `_escribirFormulaGF_()` | Separador de argumentos que funcionó en la hoja |

**Hallazgo clave**: el estado del sistema vive en **dos almacenes distintos** — columnas/celdas del Sheet (circuito público + promediar + estado RSI) y Script Properties (bloques privados 1-5). Ver §9.5.

---

## 4. Funciones Apps Script (inventario completo)

### 4.1. Puntos de entrada (disparados por trigger)

| Función | Archivo | Disparo | Qué hace | Envía a |
|---|---|---|---|---|
| `enviarRadarDiario()` | UNIFICADAS | Diario ~9:00 (manual) | Top 5 gangas USA + exUSA (desc. con margen > 0) | Canal |
| `comprobarAlertasIndividuales()` | UNIFICADAS | Cada 15 min (solo 08:00-23:00, creado/borrado por orquestación) | Alerta al pasar a COMPRA GANGA / BUENA COMPRA; cooldown 1 h + anti-repetición por estado (cols U/V); incluye análisis IA | Canal |
| `enviarRecordatorioAleatorio()` | UNIFICADAS | Diario ~21:00 (manual) | 1 ganga USA + 1 exUSA al azar; enfriamiento 3 días (col R); máx 1/hoja/día (AJ4/AK4); análisis IA | Canal |
| `enviarRecordatorioFinDeSemana()` | UNIFICADAS | Sáb/dom (manual) | Igual que el nocturno con frases de finde (mismo motor `_enviarRecordatorio`) | Canal |
| `enviarRecordatorioSemanal()` | UNIFICADAS | Lunes AM (manual) | Mensaje fijo explicando el sistema (marca AL4) | Canal |
| `comprobarAlertasIntradia()` | Intradía | Cada 30 min (solo 08:00-23:00) | Guarda interna L-V 9:00-21:00. Ejecuta **B1** (±5/10/15% día) + **B2** (valoración 3 niveles) + **B5** (nuevos mínimos) | Privado |
| `comprobarAlertasSemanalesMensuales()` | Intradía | Diario 17:00 | **B3**: escalones semanales (±10/20) y mensuales (±20/30) sobre cols L/M; solo L-V | Privado |
| `comprobarAlertasRSI()` | Intradía | Diario ~17:30 | **B4**: RSI(14) Wilder × tendencia SMA200 en `Alertas SMA200` + `Otras Empresas2`; escribe N-Q; solo L-V | Privado |
| `comprobarAlertasPromediar()` | Promediar | Diario 18:00 | Avisa por cambio de tramo de la señal H (precio ≤ SMA200 + semáforo en compra); **sin guarda de día** (corre también sáb/dom) | Privado |
| `activarTriggersDiurnos()` | Intradía | Diario 08:00 | Crea los 2 triggers de alta frecuencia si no existen | — |
| `desactivarTriggersNocturnos()` | Intradía | Diario 23:00 | Borra los 2 triggers de alta frecuencia | — |

### 4.2. Motores y helpers de negocio

| Función | Archivo | Rol |
|---|---|---|
| `obtenerRanking(rankingHoja, bunkerHoja, top)` | UNIFICADAS | Cruza Ranking (top-N por puesto) con Bunker (precios/descuentos por ticker); filtra desc. con margen > 0 |
| `construirLineaRanking(op, divisa)` | UNIFICADAS | Formatea una línea del radar |
| `_enviarRecordatorio(saludo, cabecera)` | UNIFICADAS | Motor compartido nocturno/finde: candidatas en ganga (estado o precio ≤ ganga×1.0001) + enfriamiento 3 días + selección aleatoria |
| `obtenerAnalisisGemini(op)` | UNIFICADAS | **Groq** `llama-3.1-8b-instant` (el nombre es histórico): resumen 3 líneas; caché 24 h; fallback de texto fijo si falla |
| `_intraBloqueValoracion_()` | Intradía | B2: detecta subida de nivel de compra (1→2→3) en hojas Bunker; distingue cartera vs candidata |
| `_intraBloqueMinimos_()` / `_minimoVentana_()` | Intradía | B5: precio vivo vs mínimo de cierre de 1m/3m/6m/1año (informa la ventana más profunda rota) |
| `_procesarHojaRSI_()` | Intradía | B4 por hoja: transición de estado RSI → 1 de 7 mensajes según cruce con SMA200; actualiza N-Q siempre |
| `calcularRSI(ticker)` | Intradía | RSI(14) Wilder sobre cierres de `_scratchRSI` (semilla media simple + suavizado exponencial; hasta 3 reintentos con sleep si la fórmula es nueva) |
| `determinarEstadoRSI(rsi)` | Intradía | <30 SOBREVENTA, >70 SOBRECOMPRA, si no NORMAL (30/70 exactos = NORMAL) |
| `_asegurarFormulasRSI_` / `_escribirFormulaGF_` / `_formulaGF_` / `_bloqueRSI_` / `_leerCierresRSI_` / `_scratchRSI_` | Intradía | Gestión de la hoja scratch (índice de bloques, escritura de fórmula con detección de separador `;`/`,`, lectura de cierres) |
| `_chequearBajada_` / `_chequearSubida_` | Intradía | Motor genérico de escalones con reset (usado por B1 y B3) |
| `_detectarEstado_` / `_rankEstado_` | Intradía | Clasificación de la Decisión en 3 niveles con ranking |
| `esEstadoAlerta` / `normalizarEstado` | UNIFICADAS | Clasificación de la Decisión en 2 estados (circuito público) |
| `iconoFiltro` / `formatPct` | UNIFICADAS | Presentación (usados también por el circuito privado) |
| `_norm_` / `_intraNum_` / `_fmt_` | Intradía | Normalización texto (NFD sin tildes) / número tolerante (coma, %) / formato español |
| `_mapaDivisas_` / `_mapaPrecios_` / `_tickersCartera_` | Intradía | Mapas ticker→divisa, ticker→precio (fallback), set de cartera (distingue mensajes) |
| `_intraEnHorario_` | Intradía | ¿L-V 9:00-21:00 Madrid? |
| `enviarPrivado(mensaje)` | Promediar | Envío a los chat_id de `CFG_SMA.DESTINATARIOS_PRIVADOS` (Ale y Rubén); true si ≥1 OK |
| `ejecutarEnvio(mensaje)` | UNIFICADAS | Envío al canal `CONFIG.CHAT_ID` |

### 4.3. Instalación, diagnóstico y utilidades

| Función | Rol | Observación |
|---|---|---|
| `configurarHorarioOperativo()` | Instala la orquestación 08:00/23:00 (ejecutada el 18/06) | Limpia triggers previos antes |
| `instalarTriggerSemanalMensual()` / `instalarTriggerRSI()` / `instalarTriggerPromediar()` | Instaladores idempotentes de los diarios | — |
| `instalarTriggerIntradia()` | Crea el trigger de 30 min | **Legacy**: superado por el horario operativo; si se ejecutara, crearía el trigger 24/7 |
| `verEstadoAntiSpam()` | Lista claves `INTRA_/SEMANAL_/MENSUAL_/RSI_/MINIMO_` | Diagnóstico |
| `testRSI()` / `verCierresRSI()` | Diagnóstico del RSI (AAPL/MSFT; cierres crudos) | Diagnóstico |
| `verChatIdsRecientes()` | Descubrir chat_id privados vía getUpdates | Setup |
| `testGemini()` / `diagnosticoTelegram()` | Prueba de Groq / de Telegram | Diagnóstico; `diagnosticoTelegram` tiene el chat de Ale hardcodeado |
| `guardarTokenTelegram()` | Guardar token (editar código, ejecutar, borrar) | One-shot |
| `enviarTelegram(chatIds, mensaje, token)` | Envío genérico | **Huérfana** — nunca llamada |
| `_existeTrigger_` / `_borrarTriggersPorNombre_` | Gestión de triggers | — |

---

## 5. Triggers y línea temporal diaria (hora Madrid)

```
00:00-08:00  SILENCIO TOTAL (cero ejecuciones; garantizado borrando los triggers)
08:00        activarTriggersDiurnos  → crea los 2 triggers de alta frecuencia
08:00-23:00  comprobarAlertasIndividuales  cada 15 min  (guarda interna: hora ≥ 8)
09:00-21:00  comprobarAlertasIntradia      cada 30 min  (guarda interna: L-V 9-21) → B1+B2+B5
~09:00 L-V   enviarRadarDiario             (trigger manual; marca AI4)
lunes AM     enviarRecordatorioSemanal     (trigger manual; marca AL4)
17:00 L-V    comprobarAlertasSemanalesMensuales  → B3
~17:30 L-V   comprobarAlertasRSI                 → B4 (escribe N-Q)
18:00 (todos los días)  comprobarAlertasPromediar
~21:00 L-V   enviarRecordatorioAleatorio   (trigger manual)
sáb/dom      enviarRecordatorioFinDeSemana (trigger manual)
23:00        desactivarTriggersNocturnos   → borra los 2 de alta frecuencia
```

- Motivo de la orquestación: Apps Script no permite limitar `everyMinutes()` a una franja; cada disparo cuenta como ejecución aunque haga `return`.
- Los triggers "manuales" (públicos) se crearon a mano en el editor; **no hay instalador** para ellos.
- Todas las funciones tienen guardas internas defensivas (día/hora), de modo que un disparo fuera de hora no hace nada.

---

## 6. Conexión con Telegram

| Vía | Función | Destino | Formato | Usada por |
|---|---|---|---|---|
| Canal público | `ejecutarEnvio()` | `CONFIG.CHAT_ID = "-1003890521410"` (hardcodeado) | Markdown | Radar, condición, recordatorios |
| Privado | `enviarPrivado()` | `CFG_SMA.DESTINATARIOS_PRIVADOS = ["1193956123" (Ale), "8724674373" (Rubén)]` (hardcodeados) | Markdown | BLOQUES 1-5 + promediar |
| Genérica | `enviarTelegram()` | Parámetro | Texto plano | **Nadie** (huérfana) |

- Token: Script Property `TELEGRAM_TOKEN`. Bot: `@alertagangabot`.
- Solo salida (sendMessage); no hay webhook ni comandos entrantes. `getUpdates` solo se usa en diagnóstico/descubrimiento de chat_ids.
- `ejecutarEnvio` no usa `muteHttpExceptions`; `enviarPrivado` sí. `enviarPrivado` devuelve true si **al menos uno** de los dos recibe (si falla el de Rubén, el anti-spam se marca igual).
- Tras cada envío con éxito: `Utilities.sleep(1000-2000)` para no golpear el rate limit.

## 7. APIs externas

| API | Dónde | Autenticación | Fallo → |
|---|---|---|---|
| Telegram Bot API (`sendMessage`, `getUpdates`, `getMe`) | Los 3 envíos + diagnóstico | `TELEGRAM_TOKEN` | Log; el estado anti-spam NO se marca si falla el envío (correcto) |
| Groq `chat/completions` (`llama-3.1-8b-instant`) | `obtenerAnalisisGemini()` | `GROQ_API_KEY1` | Texto de respaldo fijo; la alerta sale igual |
| GOOGLEFINANCE (función de Sheets, no HTTP) | Fórmulas de las hojas (precios, SMA200, var%) + `_scratchRSI` (histórico de cierres) | — | Precio: fallback a hojas Bunker; RSI: fila no se toca, se loguea |

---

## 8. Mapa de dependencias

### 8.1. Técnicas (cadena de componentes)

```
GOOGLEFINANCE ──> Google Sheet (fórmulas: precios, SMA200, var%, valoración, semáforo, ranking)
                        │
                        ▼
              Apps Script (lee hojas + Script Properties)
                        │            │
                        │            ├──> Groq (análisis IA, solo circuito público)
                        ▼            ▼
              Escrituras de estado   Telegram Bot API
              (Sheet cols U/V/R/I/J/N-Q,      ├──> Canal público
               celdas AI4-AL4,                └──> Chats privados Ale y Rubén
               Script Properties INTRA_*/RSI_*/...)
```

### 8.2. Funcionales (quién depende de qué concepto)

- **Decisión (col E Bunker)** ← fórmulas de valoración de la hoja (7 modelos + margen, NO auditados aún). De ella dependen: radar (icono), alertas de condición, recordatorios, B2.
- **Señal/Tramo (col H cartera)** ← fórmula de la hoja (precio ≤ SMA200 + semáforo). De ella depende: promediar. *La lógica de negocio de esta señal vive en el Excel, no en el código.*
- **RSI (calculado en código)** ← cierres de `_scratchRSI` ← GOOGLEFINANCE. De él dependen: estado RSI (col O) → transición → señal (col Q) → mensaje B4.
- **Tendencia** = precio vs SMA200 (col D, fórmula de hoja). Cruza con RSI para elegir 1 de 7 mensajes.
- **Cartera vs candidata** ← presencia del ticker en `Alertas SMA200` (`_tickersCartera_`). Cambia el texto de B2 y B4.
- **Divisa del mensaje** ← en qué hoja Bunker aparece el ticker (`_mapaDivisas_`); si no aparece, sin símbolo.
- **Precio del circuito privado** ← col C de la hoja A-Q, con fallback al precio de las hojas Bunker.

### 8.3. Temporales (orden que importa)

1. `_scratchRSI` necesita una ejecución **previa** para que sus fórmulas estén resueltas (por eso son persistentes). Ticker nuevo → primer RSI puede fallar; a la siguiente ejecución funciona.
2. B5 (mínimos) reutiliza los cierres de `_scratchRSI` mantenidos por B4: si B4 dejara de ejecutarse, B5 seguiría funcionando solo mientras las fórmulas sigan vivas.
3. La orquestación 08:00/23:00 debe ejecutarse antes que cualquier alerta de alta frecuencia exista.
4. B1/B3 comparan contra el escalón previo guardado en Script Properties: el estado persiste entre días/semanas y se resetea solo al cruzar el umbral de reset.
5. El radar depende de que las hojas Ranking estén recalculadas a la hora de ejecución (~9:00).

---

## 9. Informe de redundancias

1. **Tres funciones de envío a Telegram**: `ejecutarEnvio()` (canal), `enviarPrivado()` (privados), `enviarTelegram()` (genérica, huérfana). Tres implementaciones del mismo POST.
2. **Definición de columnas Bunker duplicada**: `BCOLS` (archivo público) y `CFG_INTRA.B_*` (privado) definen las mismas columnas dos veces (el propio código lo reconoce en comentario).
3. **Dos normalizadores de texto**: `normalizarEstado()` (quita todo lo no alfanumérico) y `_norm_()` (NFD sin tildes). Mismo propósito, implementaciones distintas → un mismo valor podría clasificarse distinto en cada circuito.
4. **Dos detectores del estado de compra**: `esEstadoAlerta()` (público, 2 estados, sin ranking) y `_detectarEstado_()` (privado, 3 estados con ranking). Lógica solapada sobre la misma columna E.
5. **Cuatro mecanismos de anti-spam** conviviendo: (a) columnas de hoja (U/V, I/J, R), (b) celdas mágicas (AI4-AL4), (c) Script Properties de escalón (INTRA_/SEMANAL_/MENSUAL_), (d) Script Properties de timestamp/día (INTRA_VALOR_TS, RSI_ALERT, MINIMO_DIA). Cada bloque inventó el suyo.
6. **Dos alertas de valoración sobre las mismas hojas Bunker**: `comprobarAlertasIndividuales` (público: 2 estados, cooldown 1 h, estado en cols U/V, cada 15 min) y `_intraBloqueValoracion_` (privado: 3 niveles, cooldown 4 h, estado en Properties, cada 30 min). Detección casi idéntica, implementada dos veces con persistencia distinta.
7. **`instalarTriggerIntradia()`** duplica lo que ya hace `activarTriggersDiurnos()` — resto de la época anterior al horario operativo.
8. **Doble aseguramiento de fórmulas RSI**: `comprobarAlertasRSI` llama a `_asegurarFormulasRSI_` con todos los tickers, y después `calcularRSI` vuelve a llamarla por cada ticker (re-escaneo del índice de bloques en cada llamada).
9. **Fallback de precio duplicado**: B1 y B5 repiten el mismo patrón `precio col C || _mapaPrecios_`.
10. **Guardas redundantes** (defensivas, intencionadas): `comprobarAlertasIndividuales` comprueba `hora < 8` aunque su trigger solo existe de 08 a 23; las funciones públicas comprueban el día aunque el trigger ya se configura por día. *Documentado como diseño defensivo en el README — no es un error.*
11. **Columnas del Ranking leídas y no usadas**: D (Potencial) y G (Margen) se cargan en el rango pero nunca se consumen.

## 10. Informe de deuda técnica

1. **Configuración e identidades en el código fuente**: `CHAT_ID` del canal, los dos chat_id privados y el chat de Ale en `testTelegram.js` están hardcodeados (y versionados en GitHub). Contradice el principio "configuración sobre código" de la Fase 1.
2. **Umbrales de negocio hardcodeados**: RSI 30/70, escalones ±5/10/15..., cooldowns (1 h/2 h/4 h/3 días), ventanas de mínimos. Están al menos centralizados en `CFG_*`, pero cambiarlos exige redeploy.
3. **Comentarios/nombres obsoletos**: el docstring de `comprobarAlertasPromediar()` dice "Recorre la pestaña Otras Empresas1" pero recorre `Alertas SMA200`; el comentario de `comprobarAlertasIndividuales` dice "cada hora" (real: 15 min); `obtenerAnalisisGemini` llama a Groq; el comentario de `calcularRSI` dice "~100 sesiones" (real: ~252); cabecera del archivo principal dice "TERMINAL BÚNKER v2.0".
4. **Código muerto/one-shot en producción**: `enviarTelegram()` (huérfana), `guardarTokenTelegram()` (plantilla con `TU_TOKEN_AQUI`), `diagnosticoTelegram()` con chat hardcodeado.
5. **Acoplamiento implícito entre archivos**: `CONFIG`, `CFG_SMA`, `enviarPrivado`, `formatPct`, `iconoFiltro` se comparten vía scope global de Apps Script, sin declaración de dependencias (los headers lo documentan, pero nada lo garantiza). Borrar o renombrar un archivo rompe otros en silencio.
6. **Dos generaciones de estilo**: archivo público en `const`/arrow/template literals; archivos privados en `var`/concatenación. Dificulta el mantenimiento uniforme.
7. **Convenciones de unidades inconsistentes**: descuentos como fracción (0.15) vs variaciones como porcentaje (−5). `formatPct` solo sirve para las primeras; `_fmt_` para las segundas.
8. **Zonas horarias mezcladas**: `Session.getScriptTimeZone()` (radar/recordatorios), literal `'Europe/Madrid'` (condición), `CFG_INTRA.ZONA` (privados). Hoy coinciden todas (manifest = Madrid), pero son tres fuentes de verdad.
9. **Acoplamiento posicional hoja↔código**: índices de columna y celdas mágicas (AI4-AL4) fijados en constantes. Insertar/mover una columna en el Excel rompe el bot sin error visible.
10. **Sin notificación de fallos**: los errores van a Logger/console; si un bloque falla días seguidos, nadie se entera salvo mirando el panel de ejecuciones.
11. **Sin tests automatizados**: solo diagnósticos manuales (`testRSI`, `testGemini`, `diagnosticoTelegram`, `verCierresRSI`, `verEstadoAntiSpam`).
12. **`_scratchRSI` crece sin límite**: los bloques de tickers que salen de las hojas nunca se limpian; sus fórmulas GOOGLEFINANCE siguen vivas y recalculando para siempre.
13. **Hack del separador de fórmula** (`RSI_SEP_FORMULA`): solución ingeniosa pero frágil, dependiente del idioma/configuración regional de la hoja.
14. **Procesos manuales**: paso de empresas de `Otras Empresas1` → `Otras Empresas2` a mano; triggers públicos creados a mano; token guardado editando código.
15. **`enviarPrivado` marca anti-spam con 1 solo éxito**: si el envío a Rubén falla sistemáticamente, él pierde alertas sin que el sistema lo detecte ni reintente.
16. **`comprobarAlertasPromediar` corre también en fin de semana** (sin guarda de día, a diferencia del resto). Inofensivo con mercados cerrados, pero inconsistente.
17. **Escrituras celda a celda** en bucles (`setValue` por fila en alertas de condición, promediar y RSI): lento y consume cuota; B4 además hace `getRange().setValues()` por cada fila.

## 11. Oportunidades de simplificación (REGISTRO — no implementar en Fase 0)

| # | Oportunidad | Relación |
|---|---|---|
| S1 | Unificar el envío Telegram en una sola función con destino parametrizado; retirar `enviarTelegram()` huérfana | R1 |
| S2 | Un único normalizador y un único clasificador de la Decisión (con niveles) compartidos por ambos circuitos | R3, R4 |
| S3 | Una única definición de layouts de hojas (columnas) compartida | R2, D9 |
| S4 | Un único mecanismo de persistencia del estado de notificación (capa "eventos" de V3); hoy hay 4 | R5 → encaja con Fase 5 (Motor de Eventos) |
| S5 | Fusionar la detección de valoración pública y privada en un motor único con dos presentaciones | R6 → encaja con Fases 3-6 |
| S6 | Retirar `instalarTriggerIntradia()` (legacy) | R7 |
| S7 | Mover configuración (umbrales, cooldowns, chat_ids, canal) a Script Properties o a una hoja `Config` | D1, D2 → principio de Fase 1 |
| S8 | `calcularRSI` sin re-asegurar fórmulas por ticker: asegurar una vez, leer N veces | R8 |
| S9 | Limpieza automática (o manual documentada) de bloques huérfanos en `_scratchRSI` | D12 |
| S10 | Homogeneizar unidades (% vs fracción) y una sola fuente de zona horaria | D7, D8 |
| S11 | try/catch global en cada punto de entrada con aviso privado a Ale en caso de error | D10 |
| S12 | Corregir comentarios/nombres obsoletos (`obtenerAnalisisGemini` → `obtenerAnalisisIA`, docstrings) | D3 |
| S13 | Escrituras por lotes (acumular y un solo `setValues` por hoja) | D17 |
| S14 | Guarda de día laborable también en `comprobarAlertasPromediar` (consistencia) | D16 |
| S15 | Control de éxito por destinatario en `enviarPrivado` (que un fallo persistente a Rubén sea visible) | D15 |

## 12. Clasificación: dato / indicador / lógica

| Categoría | Elementos | Dónde vive |
|---|---|---|
| **DATO** (crudo) | Precio actual, cierres históricos, SMA200*, var% día/semana/mes*, nombre, ticker | Fórmulas del Sheet (GOOGLEFINANCE) + `_scratchRSI` |
| **INDICADOR** (derivado) | RSI(14), mínimos 1m/3m/6m/1a, descuentos con/sin margen, precio ganga, distancia a SMA200, puesto en ranking | RSI y mínimos: **código**; el resto: **fórmulas del Sheet** |
| **CONCEPTO implícito** (sin nombre en el sistema) | Tendencia (precio vs SMA200), nivel de compra (1/2/3), "en cartera vs candidata", "ganga" | Disperso en código (condiciones inline) |
| **LÓGICA de decisión** | Decisión (col E), Semáforo (col G), Señal/Tramo (col H), veredictos de Otras Empresas1 | **Fórmulas del Sheet (no auditadas aún)** |
| **LÓGICA de eventos** | Transiciones de estado, escalones, cooldowns, anti-repetición | Código + 4 almacenes de estado |
| **PRESENTACIÓN** | Mensajes, frases aleatorias, emojis, formato español, disclaimer | Código (mezclada dentro de cada bloque) |

\* SMA200 y var% son indicadores calculados por fórmula, pero el código los consume como dato.

**Observación central para V3**: la "lógica de decisión" más importante del sistema (valoración → Decisión/Semáforo/Señal) vive en fórmulas del Excel que **este repositorio no contiene**. La auditoría del código está completa; la del sistema no lo estará hasta auditar esas fórmulas (§13).

---

## 13. Pendiente de auditar (Parte B) — ✅ COMPLETADA en `AUDITORIA-FASE-0-PARTE-B.md`

Los 8 puntos siguientes quedaron resueltos el 2026-07-02 auditando el duplicado DEV del Sheet:

1. **Fórmulas de las hojas Bunker**: cómo se calculan Decisión (E), Precio ganga (L), descuentos (N/O) — los 7 modelos de valoración y el margen por sector.
2. **Hojas Ranking**: fórmula de ordenación y del puesto.
3. **`Otras Empresas1`**: las 2 capas del filtro de calidad y las tablas de valoración (layout completo).
4. **Layout A-Q**: fórmulas exactas de C (precio), D (SMA200), E (dist), F (alerta — ¿quién la usa?), G (semáforo), H (señal/tramo), K/L/M (var%).
5. **Celdas de control**: confirmar que AI4/AJ4/AK4/AL4 no colisionan con nada más en esas hojas.
6. **Inventario real de triggers** instalados (panel de Apps Script) vs los documentados aquí.
7. **Script Properties reales** (valores presentes de anti-spam, confirmar que no hay claves huérfanas de tickers antiguos).
8. Columnas de las hojas que el código **no** lee (para el diccionario de datos completo).

---

## Veredicto de la Parte A

- El código de producción está **100 % sincronizado** con el repositorio y con el README (verificado línea a línea; el README es fiel, con las pequeñas salvedades de comentarios internos anotadas en D3).
- No se detectó ningún comportamiento no documentado en el README.
- **Ningún cambio realizado.** Todas las mejoras detectadas quedan registradas en §11 y en Open Decisions.
