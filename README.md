# ValueRadar — Búnker de Inversión

Sistema de alertas de inversión basado en **valoración fundamental** + **señales técnicas**, ejecutado sobre Google Sheets con Google Apps Script. Envía notificaciones automáticas a Telegram: un **canal público** con las mejores oportunidades del mercado y un **flujo privado** (solo Ale y Rubén) que vigila la cartera propia.

Este documento describe **todo** lo que hace el sistema, función por función.

---

## 1. Visión general

Hay dos grandes circuitos de notificación, totalmente independientes:

| Circuito | Destino | Para qué |
|----------|---------|----------|
| **Público** | Canal de Telegram (`CONFIG.CHAT_ID`) | Mejores gangas del mercado por valoración fundamental, con análisis IA |
| **Privado** | Chats de Ale y Rubén (`enviarPrivado()`) | Vigilancia de la cartera propia: precio, variaciones, RSI, SMA200, mínimos y oportunidades de promediar |

Ningún mensaje privado llega al canal, y viceversa.

---

## 2. Circuito PÚBLICO (`ALERTAS DE INVERSIÓN UNIFICADAS.js`)

Es el motor principal. Trabaja sobre las hojas `Bunker de inversion USA` / `exUSA` y sus `Ranking`. Lanza **cinco** tipos de mensaje:

### 2.1. Radar diario — `enviarRadarDiario()`
- **Cuándo:** mañanas de lunes a viernes (~9:00). Se salta fines de semana y evita repetir el mismo día (marca de fecha en la celda `AI4`).
- **Qué envía:** el **Top 5 de gangas USA** y el **Top 5 exUSA**, leídos de las hojas `Ranking` y cruzados con precios/descuentos de las hojas `Bunker`. Solo incluye empresas con **descuento con margen positivo**.
- Cada línea muestra puesto, nombre + ticker (con icono de filtro 🟢/❗), precio actual, precio ganga, descuento con y sin margen.
- Frase de apertura aleatoria entre 4 variantes.

### 2.2. Alerta de cambio de condición — `comprobarAlertasIndividuales()`
- **Cuándo:** de forma recurrente durante el horario operativo (ver §6). Solo actúa a partir de las 8:00 (hora Madrid).
- **Qué hace:** recorre las dos hojas Bunker y, cuando una empresa **pasa a estado "COMPRA GANGA" o "BUENA COMPRA"**, avisa en tiempo real.
- **Anti-spam:** no repite si el estado notificado (columna U) es el mismo, y respeta un **enfriamiento de 1 hora** por empresa (fecha en columna V).
- Incluye el **análisis IA** de la empresa (ver §5).

### 2.3. Recordatorio nocturno — `enviarRecordatorioAleatorio()`
- **Cuándo:** noches de lunes a viernes (~21:00).
- **Qué hace:** elige **1 ganga USA + 1 exUSA al azar** entre las que están en zona ganga, con **enfriamiento de 3 días** por empresa (fecha en columna R) y máximo 1 por hoja y día (contador en `AJ4`, fecha en `AK4`).
- Incluye análisis IA.

### 2.4. Recordatorio de fin de semana — `enviarRecordatorioFinDeSemana()`
- **Cuándo:** sábados y domingos.
- Idéntico al nocturno (mismo motor `_enviarRecordatorio`), con frases de apertura propias de fin de semana.

### 2.5. Recordatorio semanal explicativo — `enviarRecordatorioSemanal()`
- **Cuándo:** lunes por la mañana (una vez; marca de fecha en `AL4`).
- **Qué hace:** envía un mensaje fijo explicando **cómo funciona el Búnker** (los 2 filtros de cribado, los 7 modelos de valoración y la leyenda de iconos 🟢/❗).

---

## 3. Circuito PRIVADO — cartera de Ale y Rubén

Vive en `alertasIntradiaPrivadas.js` y `alertasPromediarSMA200.js`. Todo se envía con `enviarPrivado()`, que manda el mensaje solo a los `chat_id` de `CFG_SMA.DESTINATARIOS_PRIVADOS` (Ale y Rubén). Trabaja principalmente sobre la hoja **`Alertas SMA200`** (la cartera propia), con layout de columnas A–Q.

### BLOQUE 1 — Precio intradía · `comprobarAlertasIntradia()`
- **Cuándo:** cada 30 min, **9:00–21:00 L-V** (control interno de horario).
- **Qué hace:** sobre cada acción de la cartera, avisa de **caídas y subidas del día** por escalones:
  - Caída: **-5% / -10% / -15%** (reset al volver por encima de -3%).
  - Subida: **+5% / +10% / +15%** (reset por debajo de +3%).
- Solo avisa al cruzar un escalón más extremo que el ya avisado (control en Script Properties `INTRA_CAIDA_*` / `INTRA_SUBIDA_*`).

### BLOQUE 2 — Valoración intradía · `_intraBloqueValoracion_()`
- Se ejecuta dentro de `comprobarAlertasIntradia()` (mismo trigger).
- Recorre las hojas Bunker (USA y exUSA) y avisa cuando una empresa **entra o profundiza en zona de compra**, con tres niveles: `COMPRA RAZONABLE` (1) → `BUENA COMPRA` (2) → `COMPRA GANGA / PRECIO BAJO GANGA` (3).
- **Anti-spam:** solo avisa si el nivel sube respecto al anterior, con **enfriamiento de 4 horas** (`INTRA_VALOR_*`).
- El mensaje **distingue** si la empresa está en cartera (refuerzo de posición) o si es una candidata del Búnker (iniciar posición).

### BLOQUE 3 — Variaciones semanal y mensual · `comprobarAlertasSemanalesMensuales()`
- **Cuándo:** una vez al día (~17:00, L-V).
- **Qué hace:** sobre la cartera, avisa por escalones de variación acumulada:
  - **Semanal:** caída -10% / -20% (reset -5%), subida +10% / +20% (reset +5%).
  - **Mensual:** caída -20% / -30% (reset -10%), subida +20% / +30% (reset +10%).
- Lee las columnas L (var% semana) y M (var% mes) de la hoja. Control en `SEMANAL_*` / `MENSUAL_*`.

### BLOQUE 4 — RSI + SMA200 (multi-hoja) · `comprobarAlertasRSI()`
- **Cuándo:** una vez al día (~17:30, L-V).
- **Qué hace:** calcula el **RSI(14)** con suavizado de Wilder (mismo método que TradingView, ~252 sesiones de histórico) y lo **cruza con la tendencia de fondo** (precio vs su SMA200):

  | RSI | Precio vs SMA200 | Señal |
  |-----|------------------|-------|
  | Sobreventa (<30) | Por encima | 🟢 POSIBLE COMPRA (rebote en tendencia alcista) |
  | Sobreventa (<30) | Por debajo | ⚠️ VIGILAR — posible "cuchillo cayendo" |
  | Sobrecompra (>70) | Por debajo | 🔴 POSIBLE VENTA / reducir (rebote agotado) |
  | Sobrecompra (>70) | Por encima | ⬆️ FUERZA ALCISTA (ni comprar ni vender con prisa) |
  | Vuelta a 30–70 | — | ℹ️ aviso informativo de cambio de estado |

- Procesa **todas las hojas de `CFG_INTRA.HOJAS_RSI`** (por defecto `Alertas SMA200` = cartera, y `Otras Empresas2` = mini búnker), siempre con el mismo layout A–Q.
- **Escribe en cada hoja:** columna N (RSI), O (estado), P (fecha), Q (última señal).
- El mensaje distingue cartera vs candidata. **Anti-spam:** 1 alerta por hoja+ticker cada **2 horas** (`RSI_ALERT_*`).
- Usa la hoja oculta **`_scratchRSI`**, con fórmulas `GOOGLEFINANCE` persistentes (un bloque de 3 columnas por ticker) que descargan ~365 días de cierres.

### BLOQUE 5 — Nuevos mínimos (solo cartera) · `_intraBloqueMinimos_()`
- Se ejecuta dentro de `comprobarAlertasIntradia()` (cada 30 min, 9:00–21:00 L-V). **Solo** sobre la hoja `Alertas SMA200`.
- **Qué hace:** compara el **precio en vivo** con los mínimos de cierre de cuatro ventanas y avisa cuando marca un **nuevo mínimo**:
  - **1 mes** (~21 sesiones), **3 meses** (~63), **6 meses** (~126), **1 año** (~252).
- De todas las ventanas que rompe, informa de la **más profunda** (1 año > 6m > 3m > 1m): un único mensaje.
- **Anti-spam:** máximo **1 aviso por ticker y día natural** (`MINIMO_DIA_*`). Si baja, se recupera y vuelve el mismo día, no reavisa; al día siguiente sí puede volver a avisar.
- Reutiliza los cierres ya descargados en `_scratchRSI`.

### Promediar a la baja (SMA200) · `comprobarAlertasPromediar()` (`alertasPromediarSMA200.js`)
- **Cuándo:** una vez al día (~18:00).
- **Qué hace:** sobre la hoja `Alertas SMA200`, avisa cuando una posición de la cartera tiene **precio ≤ SMA200** y el **semáforo de valoración** está en zona de compra (la señal viene precalculada por fórmula en la columna H "Señal / Tramo").
- **Anti-spam por cambio de tramo:** no repite el mismo tramo (columna I = estado avisado, J = fecha); avisa al instante si profundiza y se resetea cuando la señal desaparece.

---

## 4. Cálculo del RSI (detalle técnico)

`calcularRSI(ticker)` implementa el **RSI(14) de Wilder**:
1. La hoja oculta `_scratchRSI` mantiene, por ticker, una fórmula `GOOGLEFINANCE(ticker,"close",TODAY()-365,TODAY())` **persistente** (las fórmulas escritas por script no se resuelven en la misma ejecución, por eso se dejan vivas y se leen ya calculadas en ejecuciones posteriores).
2. Semilla: media simple de las primeras 14 variaciones; luego suavizado exponencial (factor 1/14) sobre todo el histórico (~252 sesiones), igual que TradingView.
3. Se ignoran cierres ≤ 0 (GOOGLEFINANCE a veces cuela ceros que falsearían el RSI).
4. Maneja el separador de argumentos de la fórmula (`;` o `,` según idioma de la hoja) y reescribe fórmulas en `#ERROR` o `#N/A` (ticker inválido).

Utilidades de diagnóstico: `testRSI()`, `verCierresRSI()`.

---

## 5. Análisis IA de cada empresa

`obtenerAnalisisGemini(op)` (el nombre es histórico) genera un resumen breve de cada empresa: **a qué se dedica**, **por qué es un "castillo" (MOAT)** y **por qué hay miedo hoy**.

- **Proveedor real:** **Groq**, modelo **`llama-3.1-8b-instant`** (`api.groq.com`, clave `GROQ_API_KEY1`).
- **Caché:** la respuesta se guarda 24 h en Script Properties (`GROQ_CACHE_<ticker>`) para no repetir llamadas.
- Si la API falla o no hay clave, devuelve un texto de respaldo y la alerta se envía igualmente.

---

## 6. Triggers y horario operativo

Apps Script **no** permite limitar un trigger `everyMinutes()` a una franja horaria (se dispara 24/7 y cada disparo cuenta como ejecución). Para tener **cero ejecuciones de 00:00 a 08:00**, los triggers de alta frecuencia se **crean por la mañana y se borran por la noche** mediante dos triggers de orquestación.

### Configuración del horario · `configurarHorarioOperativo()` (ejecutar UNA vez)
Crea:
- `activarTriggersDiurnos` → diario a las **08:00**.
- `desactivarTriggersNocturnos` → diario a las **23:00** (deja la franja 00:00–08:00 sin ejecuciones).

`activarTriggersDiurnos()` crea (si no existen):
- `comprobarAlertasIntradia` → **cada 30 min** (BLOQUES 1, 2 y 5).
- `comprobarAlertasIndividuales` → **cada 15 min** (alertas públicas de cambio de condición).

`desactivarTriggersNocturnos()` borra esos dos por la noche.

### Triggers diarios fijos (instaladores idempotentes)
| Función | Instalador | Horario |
|---------|-----------|---------|
| `comprobarAlertasSemanalesMensuales` | `instalarTriggerSemanalMensual()` | diario ~17:00 |
| `comprobarAlertasRSI` | `instalarTriggerRSI()` | diario ~17:30 |
| `comprobarAlertasPromediar` | `instalarTriggerPromediar()` | diario ~18:00 |

### Triggers públicos a configurar manualmente
| Función | Horario recomendado |
|---------|---------------------|
| `enviarRadarDiario` | diario 9:00–10:00 |
| `enviarRecordatorioAleatorio` | diario 21:00–22:00 |
| `enviarRecordatorioFinDeSemana` | sábados y domingos |
| `enviarRecordatorioSemanal` | lunes por la mañana |

> Cada función tiene además **guardas internas** (días de semana, franja horaria), así que un disparo fuera de hora simplemente no hace nada.

Diagnóstico del anti-spam: `verEstadoAntiSpam()` lista todas las claves `INTRA_ / SEMANAL_ / MENSUAL_ / RSI_ / MINIMO_` en Script Properties.

---

## 7. Metodología de valoración

El precio objetivo de cada acción combina varios métodos ponderados por sector (con un margen de seguridad por sector); la señal "COMPRA GANGA" se activa cuando el precio cotiza por debajo del precio objetivo descontado.

| Método | Aplica a |
|--------|----------|
| DCF + Graham | Tecnología, Salud, Consumo, Industriales, Energía, Materiales, Utilities |
| P/BV | Bancos y aseguradoras |
| FFO/NAV | REITs |

El **mini búnker** (hojas `Otras Empresas`) es un flujo de cribado en 3 pasos:
1. `Otras Empresas1` — filtro de calidad en 2 capas (calidad/Moat + balance Net Debt/EBITDA) → si el veredicto es **ANALIZAR** (🟢) o **VIGILAR** (❗), pasa a la valoración por tipo de empresa (7 modelos).
2. Las que no quedan en ESPERAR / CARO se pasan **manualmente** a `Otras Empresas2`.
3. `Otras Empresas2` — el BLOQUE 4 (RSI + SMA200) las vigila igual que a la cartera propia.

---

## 8. Arquitectura

```
Google Sheets (fuente de datos)
    ├── "Bunker de inversion USA" / "exUSA"   (universo valorado + análisis)
    ├── "Ranking USA" / "Ranking exUSA"        (orden por descuento; alimenta el radar)
    ├── "Alertas SMA200"      (cartera Ale y Rubén — alertas privadas: precio, var%, SMA200, RSI, mínimos, promediar)
    ├── "Otras Empresas1"     (mini búnker pasos 1-2: filtro de calidad + valoración 7 modelos)
    ├── "Otras Empresas2"     (mini búnker paso 3: filtradas — alertas privadas RSI + SMA200)
    └── "_scratchRSI"         (oculta — fórmulas GOOGLEFINANCE persistentes para RSI y mínimos)

Google Apps Script (lógica)
    ├── ALERTAS DE INVERSIÓN UNIFICADAS.js   ← motor público (radar, condición, recordatorios) + IA + envío
    ├── alertasIntradiaPrivadas.js            ← privadas: BLOQUES 1-5 + horario operativo + RSI
    ├── alertasPromediarSMA200.js             ← privadas: promediar a la baja + enviarPrivado()
    ├── enviarTelegram.js                     ← helper de envío genérico
    ├── guardarTokenTelegram.js               ← guardar el token una vez
    └── testTelegram.js                       ← diagnóstico (diagnosticoTelegram)

APIs externas
    ├── Telegram Bot API           ← canal público + chats privados
    ├── Groq (llama-3.1-8b-instant)← análisis IA de cada empresa
    └── GOOGLEFINANCE (Sheets)     ← precios e histórico para RSI/mínimos
```

---

## 9. Configuración

### 9.1. Copiar los scripts
Abre tu Google Sheet → **Extensiones → Apps Script** → crea un archivo por cada `.js` de este repositorio y copia el contenido.

### 9.2. Adaptar `CONFIG` (en `ALERTAS DE INVERSIÓN UNIFICADAS.js`)
```js
const CONFIG = {
  HOJA_USA:      "Bunker de inversion USA",
  HOJA_EXUSA:    "Bunker de inversion exUSA",
  RANKING_USA:   "Ranking USA",
  RANKING_EXUSA: "Ranking exUSA",
  CHAT_ID:       "-100XXXXXXXXXX"   // ID de tu canal
};
```
Los destinatarios privados se configuran en `CFG_SMA.DESTINATARIOS_PRIVADOS` (usa `verChatIdsRecientes()` para obtener los `chat_id`; cada persona debe escribir antes algo al bot).

### 9.3. Credenciales (Script Properties)
**Proyecto → Configuración → Propiedades del script**:

| Propiedad | Valor |
|-----------|-------|
| `TELEGRAM_TOKEN` | Token del bot (BotFather) |
| `GROQ_API_KEY1` | API key de Groq (análisis IA) |

### 9.4. Activar la automatización
1. Ejecuta **una vez** `configurarHorarioOperativo()` (crea la franja 08:00–23:00).
2. Ejecuta **una vez** `instalarTriggerSemanalMensual()`, `instalarTriggerRSI()` e `instalarTriggerPromediar()`.
3. Crea manualmente los triggers públicos de la tabla de §6.

---

## 10. Estructura de las hojas

**Hojas "Bunker"** (columnas relevantes, datos desde la fila 2):

| Col | Campo |
|-----|-------|
| B | Nombre |
| C | Ticker |
| E | Decisión (COMPRA GANGA / BUENA COMPRA / ESPERAR, con icono 🟢/❗) |
| G | Precio actual |
| L | Precio ganga (objetivo con margen) |
| N / O | Descuento sin / con margen |
| Q | Puesto en ranking |
| R | Fecha última Compra Ganga (enfriamiento recordatorios) |
| U / V | Estado / fecha de última notificación |
| AI4 / AJ4 / AK4 / AL4 | Marcas de control (radar, contador y fecha de recordatorios, semanal) |

**Hoja "Alertas SMA200"** (layout A–Q; título en fila 1, cabeceras en fila 2, datos desde la 3):
A acción · B ticker · C precio · D SMA200 · K var% día · L var% semana · M var% mes · N RSI · O estado RSI · P fecha RSI · Q señal RSI. (Para "promediar" se usan además H señal/tramo, I estado avisado, J fecha.)

---

## 11. Aviso legal

El contenido generado por este sistema es **informativo**. No constituye asesoramiento financiero ni recomendación de compra o venta de ningún activo.
