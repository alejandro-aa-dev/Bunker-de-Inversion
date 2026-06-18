# ValueRadar

Sistema de alertas de inversión basado en valoración fundamental. Se ejecuta sobre Google Sheets con Google Apps Script y envía notificaciones automáticas a un canal de Telegram cuando una acción cae por debajo de su precio objetivo calculado.

## Qué hace

El sistema monitoriza una cartera de acciones (USA y mercados internacionales) y lanza tres tipos de alertas:

- **Radar diario** (9:00 AM, lunes a viernes) — Top 5 gangas de USA y exUSA según descuento sobre precio objetivo.
- **Alerta de condición** (cada hora) — Notifica en tiempo real cuando una acción pasa a estado "COMPRA GANGA" o "BUENA COMPRA".
- **Recordatorio nocturno** (21:00) — Repaso aleatorio de oportunidades persistentes, rotando cada 3 días.

Cada alerta incluye un análisis breve generado con **Gemini 2.5 Flash** que resume en qué trabaja la empresa, su ventaja competitiva (MOAT) y el riesgo actual percibido por el mercado.

## Metodología de valoración

El precio objetivo de cada acción se calcula combinando tres métodos ponderados según sector:

| Método | Aplica a |
|--------|----------|
| DCF + Graham | Tecnología, Salud, Consumo, Industriales, Energía, Materiales, Utilities |
| P/BV | Bancos y aseguradoras |
| FFO/NAV | REITs |

Sobre el precio objetivo combinado se aplica un margen de seguridad por sector. La señal de compra ("COMPRA GANGA") se activa cuando el precio actual cotiza por debajo del precio objetivo descontado por ese margen.

## Arquitectura

```
Google Sheets (fuente de datos)
    ├── Hoja "Bunker de inversion USA"
    ├── Hoja "Bunker de inversion exUSA"
    ├── Hoja "Ranking USA"
    ├── Hoja "Ranking exUSA"
    ├── Hoja "Alertas SMA200"      (cartera Rubén y Ale: precio, SMA200 y RSI)
    ├── Hoja "Otras Empresas1"     (sistema de valoración personal de Ale: filtro + minibúnker)
    └── Hoja "Otras Empresas2"     (alertas RSI + SMA200 de "otras empresas", layout A-Q)

Google Apps Script (lógica y automatización)
    ├── ALERTAS DE INVERSIÓN UNIFICADAS.js   ← motor principal (canal público)
    ├── alertasIntradiaPrivadas.js            ← alertas privadas: precio %, valoración y RSI+SMA200
    ├── alertasPromediarSMA200.js             ← alertas privadas: promediar a la baja
    ├── enviarTelegram.js                     ← envío a Telegram
    ├── guardarTokenTelegram.js               ← configuración del bot
    ├── listarModelosDisponibles.js           ← utilidad Gemini
    └── testTelegram.js                       ← diagnóstico

APIs externas
    ├── Telegram Bot API    ← canal de notificaciones
    └── Gemini 2.5 Flash    ← análisis IA de cada empresa
```

## Alertas privadas (cartera de Rubén y Ale)

Además del canal público, hay un bloque de alertas **privadas** que se envían solo
a los chats de Ale y Rubén (`enviarPrivado()`), nunca al canal. Viven en
`alertasIntradiaPrivadas.js` y `alertasPromediarSMA200.js`.

### Señal RSI + SMA200 (multi-hoja)

`comprobarAlertasRSI()` (trigger diario ~17:30, L-V) calcula el **RSI(14)** con
suavizado de Wilder (mismo método que TradingView) y lo **cruza con la tendencia
de fondo** (precio vs su SMA200). El cruce define la señal:

| RSI | Precio vs SMA200 | Señal |
|-----|------------------|-------|
| Sobreventa (<30) | Por encima | 🟢 POSIBLE COMPRA (rebote en tendencia alcista) |
| Sobreventa (<30) | Por debajo | ⚠️ VIGILAR — posible "cuchillo cayendo" |
| Sobrecompra (>70) | Por debajo | 🔴 POSIBLE VENTA / reducir (rebote agotado) |
| Sobrecompra (>70) | Por encima | ⬆️ FUERZA ALCISTA (sin prisa, ni comprar ni vender) |
| Vuelta a 30–70 | — | ℹ️ aviso informativo de cambio de estado |

La función procesa **todas las hojas listadas en `CFG_INTRA.HOJAS_RSI`** (por
defecto `"Otras Empresas1"` y `"Otras Empresas2"`), siempre que
compartan el mismo layout A-Q. Escribe en cada hoja las columnas **N** (RSI),
**O** (estado), **P** (fecha) y **Q** (última señal). Anti-spam: máx. 1 alerta por
hoja+ticker cada 2 h. Para añadir otra cartera basta con replicar el layout A-Q de
"Otras Empresas1" en una hoja nueva y añadir su nombre a `CFG_INTRA.HOJAS_RSI`.

## Requisitos

- Cuenta de Google con acceso a Google Sheets y Apps Script
- Bot de Telegram creado con [@BotFather](https://t.me/BotFather)
- Canal o grupo de Telegram donde el bot sea administrador
- API key de Google AI Studio (Gemini)

## Configuración

### 1. Copiar los scripts a Apps Script

1. Abre tu Google Sheet
2. Ve a **Extensiones → Apps Script**
3. Crea un archivo por cada `.js` de este repositorio y copia el contenido

### 2. Adaptar la configuración

En `ALERTAS DE INVERSIÓN UNIFICADAS.js`, edita el objeto `CONFIG` con los nombres exactos de tus hojas y el chat ID de tu canal de Telegram:

```js
const CONFIG = {
  HOJA_USA:      "Bunker de inversion USA",   // nombre de tu hoja
  HOJA_EXUSA:    "Bunker de inversion exUSA",
  RANKING_USA:   "Ranking USA",
  RANKING_EXUSA: "Ranking exUSA",
  CHAT_ID:       "-1001234567890"              // ID de tu canal
};
```

### 3. Guardar las credenciales

Las credenciales se almacenan en **Script Properties** (nunca en el código). En Apps Script ve a **Proyecto → Configuración → Propiedades del script** y añade:

| Propiedad | Valor |
|-----------|-------|
| `TELEGRAM_TOKEN` | Token de tu bot (de BotFather) |
| `GEMINI_API_KEY` | Tu API key de Google AI Studio |

Alternativamente, ejecuta `guardarTokenTelegram()` una sola vez tras reemplazar el valor por tu propio token, y luego elimina el valor del código.

### 4. Configurar los triggers automáticos

En Apps Script ve a **Triggers (reloj)** y crea:

| Función | Tipo | Horario |
|---------|------|---------|
| `enviarRadarDiario` | Basado en hora | Todos los días, 9:00–10:00 |
| `comprobarAlertasIndividuales` | Basado en hora | Cada hora |
| `enviarRecordatorioAleatorio` | Basado en hora | Todos los días, 21:00–22:00 |

## Estructura del Google Sheet

Cada fila de las hojas "Bunker" representa una empresa. Las columnas relevantes (a partir de la fila 4):

| Col | Campo |
|-----|-------|
| B | Nombre |
| C | Ticker |
| E | Decisión (COMPRA GANGA / BUENA COMPRA / ESPERAR) |
| G | Precio actual |
| L | Precio ganga (objetivo con margen de seguridad) |
| N | Descuento sin margen |
| O | Descuento con margen |
| Q | Puesto en ranking |
| U | Estado de última notificación |
| V | Fecha de última notificación |

Las hojas "Ranking" ordenan las empresas de mayor a menor descuento con margen y alimentan el radar diario.

## Aviso legal

El contenido generado por este sistema es informativo. No constituye asesoramiento financiero ni recomendación de compra o venta de ningún activo.
