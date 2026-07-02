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
 * IMPORTANTE: estas alertas son de la cartera de Rubén y Ale, así que NO van al
 * canal público; se envían por CHAT PRIVADO solo a ellos dos (enviarPrivado()).
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
       SEMAFORO:6, SENAL:7, ESTADO_NOTIF:8, FECHA_NOTIF:9 },
  // chat_id PRIVADOS de Ale y Rubén (NO el canal). Ejecuta verChatIdsRecientes()
  // para obtenerlos (cada uno debe escribir antes algo a @alertagangabot).
  DESTINATARIOS_PRIVADOS: [
    "1193956123",   // Ale
    "8724674373",   // Rubén
  ]
};

/**
 * Recorre la pestaña "Otras Empresas1" y avisa de oportunidades de
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

    if (enviarPrivado(msg)) {   // SOLO a los chats privados de Ale y Rubén
      sh.getRange(numFila, C.ESTADO_NOTIF + 1).setValue(senal);
      sh.getRange(numFila, C.FECHA_NOTIF  + 1).setValue(new Date());
      Utilities.sleep(1500);
    }
  });
}

/**
 * Envía un mensaje (Markdown) SOLO a los chats privados de CFG_SMA.DESTINATARIOS_PRIVADOS.
 * Devuelve true si al menos uno se envió con éxito.
 */
function enviarPrivado(mensaje) {
  // Guard de entorno: en DEV (MODO_DEV en 00_DEV.js) no se envía nada, solo se loguea.
  // En producción MODO_DEV no existe y este if es inocuo.
  if (typeof MODO_DEV !== "undefined" && MODO_DEV) {
    console.log("[DEV] Envío PRIVADO bloqueado por MODO_DEV. Mensaje que se habría enviado:\n" + mensaje);
    return false;
  }
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_TOKEN");
  if (!token) { console.log("❌ TELEGRAM_TOKEN no configurado"); return false; }
  const dest = CFG_SMA.DESTINATARIOS_PRIVADOS || [];
  if (!dest.length) { console.log("❌ No hay destinatarios privados. Rellena CFG_SMA.DESTINATARIOS_PRIVADOS."); return false; }

  let okAlguno = false;
  dest.forEach(chatId => {
    try {
      const res = UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "post",
        contentType: "application/json",
        muteHttpExceptions: true,
        payload: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: "Markdown" })
      });
      if (res.getResponseCode() === 200) okAlguno = true;
      else console.log(`⚠️ Falló envío privado a ${chatId}: ${res.getContentText()}`);
    } catch (e) {
      console.log(`Error envío privado ${chatId}: ${e}`);
    }
  });
  return okAlguno;
}

/**
 * Ayuda para obtener los chat_id PRIVADOS: cada uno debe escribir algo a
 * @alertagangabot y luego ejecutas esta función; mira el registro (Ver > Registros).
 * (getUpdates solo muestra mensajes recientes y no funciona si el bot usa webhook.)
 */
function verChatIdsRecientes() {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_TOKEN");
  if (!token) { console.log("❌ TELEGRAM_TOKEN no configurado"); return; }
  const res = UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/getUpdates`, { muteHttpExceptions: true });
  const json = JSON.parse(res.getContentText());
  if (!json.ok) { console.log("Error getUpdates: " + res.getContentText()); return; }
  const vistos = {};
  (json.result || []).forEach(u => {
    const m = u.message || u.edited_message;
    if (m && m.chat && m.chat.type === "private") {
      vistos[m.chat.id] = `${m.chat.first_name || ""} ${m.chat.last_name || ""} (@${m.chat.username || "sin_usuario"})`;
    }
  });
  const ids = Object.keys(vistos);
  if (!ids.length) { console.log("Sin chats privados recientes. Cada uno debe escribir algo a @alertagangabot y reintentar."); return; }
  console.log("Chats privados detectados (pega estos chat_id en DESTINATARIOS_PRIVADOS):");
  ids.forEach(id => console.log(`  ${id}  →  ${vistos[id]}`));
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
