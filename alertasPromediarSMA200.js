/**
 * ============================================================
 * ALERTAS DE PROMEDIAR A LA BAJA (SMA200) — Cartera Rubén y Ale
 * ============================================================
 * Avisa SOLO de posiciones que ya tienes (pestaña "Alertas SMA200")
 * cuando coinciden: precio <= SMA200 (técnico)  Y  semáforo en
 * ganga/buena compra (valoración + calidad, ya embebidas en el
 * semáforo). La señal viene calculada por fórmula en la hoja
 * (columna H "Señal / Tramo"); aquí solo se notifica y se evita
 * el spam con dos columnas de control (I = estado avisado, J = fecha).
 *
 * Reutiliza ejecutarEnvio() y CONFIG.DISCLAIMER del archivo
 * "ALERTAS DE INVERSIÓN UNIFICADAS".
 * ============================================================
 */

const CFG_SMA = {
  HOJA: "Alertas SMA200",
  FILA_INICIO: 3,                    // fila 1 = título, fila 2 = cabeceras
  N_COLS: 10,                        // A..J
  // Anti-spam por CAMBIO DE TRAMO (no por reloj): no repite el mismo tramo,
  // avisa al instante si profundiza, y resetea cuando la señal desaparece.
  // columnas 0-indexed
  C: { ACCION:0, TICKER:1, PRECIO:2, SMA200:3, DIST:4, ALERTA:5,
       SEMAFORO:6, SENAL:7, ESTADO_NOTIF:8, FECHA_NOTIF:9 }
};

/**
 * Recorre la pestaña "Alertas SMA200" y avisa de oportunidades de
 * promediar. Pensado para un disparador DIARIO (no intradía).
 */
function comprobarAlertasPromediar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CFG_SMA.HOJA);
  if (!sh) { console.log("❌ No existe la hoja: " + CFG_SMA.HOJA); return; }

  const ultima = sh.getLastRow();
  if (ultima < CFG_SMA.FILA_INICIO) return;

  const n = ultima - CFG_SMA.FILA_INICIO + 1;
  const data = sh.getRange(CFG_SMA.FILA_INICIO, 1, n, CFG_SMA.N_COLS).getValues();
  const C = CFG_SMA.C;

  data.forEach((fila, i) => {
    const numFila = CFG_SMA.FILA_INICIO + i;
    const accion  = String(fila[C.ACCION] || "").trim();
    const ticker  = String(fila[C.TICKER] || "").trim();
    const senal   = String(fila[C.SENAL]  || "").trim();

    if (!accion) return;

    const estadoNotif = String(fila[C.ESTADO_NOTIF] || "").trim();

    // Señal apagada: si había un aviso previo, resetéalo para permitir futuras alertas
    if (!senal) {
      if (estadoNotif) {
        sh.getRange(numFila, C.ESTADO_NOTIF + 1).clearContent();
        sh.getRange(numFila, C.FECHA_NOTIF  + 1).clearContent();
      }
      return;
    }

    if (senal === estadoNotif) return;                                // mismo tramo ya avisado

    const precio   = Number(fila[C.PRECIO]);
    const sma      = Number(fila[C.SMA200]);
    const dist     = Number(fila[C.DIST]);
    const semaforo = String(fila[C.SEMAFORO] || "").trim();

    let msg  = `🟢 *OPORTUNIDAD DE PROMEDIAR* — ${senal}\n`;
    msg += `📉 _Posición de tu cartera por debajo de su SMA200_\n\n`;
    msg += `🏷️ *${accion}* (${ticker})\n`;
    if (!isNaN(precio) && !isNaN(sma)) {
      msg += `💰 Precio: ${precio.toFixed(2)}  |  SMA200: ${sma.toFixed(2)}\n`;
    }
    if (!isNaN(dist)) {
      msg += `📏 Distancia a SMA200: ${(dist * 100 >= 0 ? "+" : "") + (dist * 100).toFixed(1)}%\n`;
    }
    msg += `🚦 Semáforo: ${semaforo}\n\n`;
    msg += `🧭 _Antes de añadir: reconfirma la tesis (calidad + valoración) y respeta tu tamaño máximo de posición. La alerta sugiere MIRAR, no vaciar la liquidez._\n\n`;
    msg += CONFIG.DISCLAIMER;   // reutiliza el aviso legal del archivo principal

    if (ejecutarEnvio(msg)) {   // reutiliza el envío a Telegram del archivo principal
      sh.getRange(numFila, C.ESTADO_NOTIF + 1).setValue(senal);
      sh.getRange(numFila, C.FECHA_NOTIF  + 1).setValue(new Date());
      Utilities.sleep(1500);
    }
  });
}

/**
 * Ejecuta UNA sola vez para crear el disparador diario (p.ej. 18:00).
 * Evita duplicar el trigger si ya existe.
 */
function instalarTriggerPromediar() {
  const yaExiste = ScriptApp.getProjectTriggers()
    .some(t => t.getHandlerFunction() === "comprobarAlertasPromediar");
  if (yaExiste) { console.log("ℹ️ El disparador ya existía."); return; }
  ScriptApp.newTrigger("comprobarAlertasPromediar")
    .timeBased()
    .everyDays(1)
    .atHour(18)
    .create();
  console.log("✅ Disparador diario (18:00) creado para comprobarAlertasPromediar.");
}
