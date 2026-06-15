/**
 * ============================================================
 * TERMINAL BÚNKER DE INVERSIÓN v2.0
 * ============================================================
 * Solo empresas con potencial positivo (sin margen), ordenadas por
 * rendimiento con margen. 2 filtros: calidad y balance.
 * Valoración exhaustiva con 7 modelos según el tipo de empresa.
 * ============================================================
 */

/* ── MODIFICACIÓN (jun 2026) ───────────────────────────────────────────────
 * Señal de filtro en las alertas: la DECISIÓN de cada empresa ahora incluye un
 * icono de filtro (🟢 = ANALIZAR / ❗ = VIGILAR) que se rellena en el Excel.
 *  - Nuevo helper iconoFiltro(decision) que extrae ese icono.
 *  - Se añade el icono junto al nombre en el radar (construirLineaRanking) y en
 *    los recordatorios (_enviarRecordatorio).
 *  - Leyenda del icono añadida al mensaje semanal.
 * Archivo relacionado nuevo: alertasPromediarSMA200.js (alertas de promediar a
 * la baja por SMA200 sobre la cartera).
 * ──────────────────────────────────────────────────────────────────────────*/

const CONFIG = {
  HOJA_USA:      "Bunker de inversion USA",
  HOJA_EXUSA:    "Bunker de inversion exUSA",
  RANKING_USA:   "Ranking USA",
  RANKING_EXUSA: "Ranking exUSA",
  CHAT_ID: "-1003890521410",
  DISCLAIMER: "⚖️ *Aviso Legal: El contenido de este canal es informativo. No constituye asesoramiento financiero ni recomendación de compra.*"
};

// Columnas Bunker (0-indexed, getValues desde fila 2)
const BCOLS = {
  NOMBRE:          1,   // B
  TICKER:          2,   // C
  DECISION:        4,   // E
  PRECIO_ACTUAL:   6,   // G
  PRECIO_GANGA:   11,   // L
  DESC_SIN:       13,   // N
  DESC_CON:       14,   // O
  PUESTO:         16,   // Q
  FECHA_ULT_GANGA:17,   // R — Última Compra Ganga
  ESTADO_NOTIF:   20,   // U
  FECHA_NOTIF:    21    // V
};

// Columnas Ranking (0-indexed, getValues desde fila 2)
const RCOLS = {
  PUESTO:    0,  // A
  NOMBRE:    1,  // B
  TICKER:    2,  // C
  POTENCIAL: 3,  // D
  DECISION:  4,  // E
  MARGEN:    6   // G
};

function normalizarEstado(str) {
  if (!str) return "";
  return String(str).replace(/[^\w\sÀ-ÿ]/gu, "").trim().toUpperCase();
}

function esEstadoAlerta(decision) {
  const d = normalizarEstado(decision);
  return d.includes("COMPRA GANGA") || d.includes("BUENA COMPRA");
}

function formatPct(val) {
  const n = (Number(val) || 0) * 100;
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

// Icono de filtro contenido en la DECISIÓN: 🟢 = pasó como ANALIZAR, ❗ = pasó como VIGILAR
function iconoFiltro(decision) {
  const m = String(decision || "").match(/🟢|❗/);
  return m ? " " + m[0] : "";
}

/**
 * 1. RADAR DIARIO — Top 5 USA + exUSA (9:00 AM, L-V)
 */
function enviarRadarDiario() {
  const hoy = new Date();
  if (hoy.getDay() === 0 || hoy.getDay() === 6) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shUSA   = ss.getSheetByName(CONFIG.HOJA_USA);
  const shexUSA = ss.getSheetByName(CONFIG.HOJA_EXUSA);
  const fechaHoyStr = Utilities.formatDate(hoy, Session.getScriptTimeZone(), "dd/MM/yyyy");

  if (shUSA.getRange("AI4").getDisplayValue() === fechaHoyStr) return;

  const topUSA   = obtenerRanking(CONFIG.RANKING_USA,   CONFIG.HOJA_USA,   5);
  const topexUSA = obtenerRanking(CONFIG.RANKING_EXUSA, CONFIG.HOJA_EXUSA, 5);

  const frasesApertura = [
    "🛰️ *SISTEMA DE RADAR: OPORTUNIDADES REALES*",
    "☕ *Buenos días. Mercados despertando...* Las mejores opciones para hoy:",
    "☀️ *Nueva jornada financiera.* Mejores gangas del Búnker:",
    "📊 *Radar matutino listo.* Top empresas con mayor descuento:"
  ];
  const saludo = frasesApertura[Math.floor(Math.random() * frasesApertura.length)];

  let msg = `${saludo}\n_Actualización: ${fechaHoyStr}_\n\n`;
  msg += "🇺🇸 *TOP 5 GANGAS USA*\n";
  msg += topUSA.length
    ? topUSA.map(op => construirLineaRanking(op, "$")).join("")
    : "_No hay empresas en rango hoy._\n";
  msg += "\n🌍 *TOP 5 GANGAS exUSA*\n";
  msg += topexUSA.length
    ? topexUSA.map(op => construirLineaRanking(op, "€")).join("")
    : "_No hay empresas en rango hoy._\n";
  msg += "\n" + CONFIG.DISCLAIMER;

  if (ejecutarEnvio(msg)) {
    shUSA.getRange("AI4").setValue(fechaHoyStr);
    shexUSA.getRange("AI4").setValue(fechaHoyStr);
  }
}

function obtenerRanking(rankingHoja, bunkerHoja, top) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Leer Ranking para obtener top 5 y orden
  const shRanking = ss.getSheetByName(rankingHoja);
  if (!shRanking) { console.log("❌ Hoja no encontrada: " + rankingHoja); return []; }
  const ultimaRanking = shRanking.getLastRow();
  if (ultimaRanking < 2) return [];
  const dataRanking = shRanking.getRange(2, 1, ultimaRanking - 1, 7).getValues();

  const topItems = dataRanking
    .map(row => ({
      puesto:   row[RCOLS.PUESTO],
      nombre:   String(row[RCOLS.NOMBRE]   || "").trim(),
      ticker:   String(row[RCOLS.TICKER]   || "").trim(),
      decision: String(row[RCOLS.DECISION] || "").trim()
    }))
    .filter(r => r.ticker && r.nombre && !isNaN(r.puesto) && r.puesto >= 1 && r.puesto <= top)
    .sort((a, b) => a.puesto - b.puesto);

  // Leer Bunker para obtener precios y descuentos por ticker
  const shBunker = ss.getSheetByName(bunkerHoja);
  const precioMap = {};
  if (shBunker) {
    const ultimaBunker = shBunker.getLastRow();
    if (ultimaBunker >= 2) {
      const dataBunker = shBunker.getRange(2, 1, ultimaBunker - 1, 16).getValues();
      dataBunker.forEach(row => {
        const t = String(row[BCOLS.TICKER] || "").trim();
        if (t) {
          precioMap[t] = {
            precioActual: row[BCOLS.PRECIO_ACTUAL],
            precioGanga:  row[BCOLS.PRECIO_GANGA],
            descSin:      row[BCOLS.DESC_SIN],
            descCon:      row[BCOLS.DESC_CON]
          };
        }
      });
    }
  }

  // Combinar y filtrar: solo empresas con descuento con margen positivo
  return topItems
    .map(r => ({
      ...r,
      ...(precioMap[r.ticker] || { precioActual: null, precioGanga: null, descSin: null, descCon: null })
    }))
    .filter(r => r.descCon === null || Number(r.descCon) > 0);
}

function construirLineaRanking(op, divisa) {
  let bloque = `🏆 *#${op.puesto}* | *${op.nombre}* (${op.ticker})${iconoFiltro(op.decision)}\n`;
  if (op.precioActual !== null) {
    bloque += `💰 Precio: ${Number(op.precioActual).toFixed(2)}${divisa} | Ganga: ${Number(op.precioGanga).toFixed(2)}${divisa}\n`;
    bloque += `🛡️ Desc. con margen: *${formatPct(op.descCon)}*\n`;
    bloque += `📈 Desc. sin margen: ${formatPct(op.descSin)}\n`;
  } else {
    bloque += `${op.decision}\n`;
  }
  bloque += `  ────────────────\n`;
  return bloque;
}

/**
 * 2. ALERTAS DE CAMBIO DE CONDICIÓN (cada hora)
 * Seguro: 1 hora entre alertas de la misma acción
 */
function comprobarAlertasIndividuales() {
  const ahora = new Date();
  const hora = Number(Utilities.formatDate(ahora, 'Europe/Madrid', 'HH'));
  if (hora < 8) return;

  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  const hoy = ahora;
  const UNA_HORA = 60 * 60 * 1000;

  const hojas = [
    { n: CONFIG.HOJA_USA,   e: "🇺🇸", d: "$" },
    { n: CONFIG.HOJA_EXUSA, e: "🌍",  d: "€" }
  ];

  hojas.forEach(h => {
    const sheet      = ss.getSheetByName(h.n);
    const ultimaFila = sheet.getLastRow();
    if (ultimaFila < 2) return;

    const data = sheet.getRange(2, 1, ultimaFila - 1, 22).getValues();

    data.forEach((fila, i) => {
      const numFila      = i + 2;
      const nombre       = fila[BCOLS.NOMBRE];
      const ticker       = fila[BCOLS.TICKER];
      const decision     = fila[BCOLS.DECISION];
      const precioActual = fila[BCOLS.PRECIO_ACTUAL];
      const precioGanga  = fila[BCOLS.PRECIO_GANGA];
      const descSin      = fila[BCOLS.DESC_SIN];
      const descCon      = fila[BCOLS.DESC_CON];
      const puesto       = fila[BCOLS.PUESTO];
      const estadoNotif  = fila[BCOLS.ESTADO_NOTIF];
      const fechaNotif   = fila[BCOLS.FECHA_NOTIF];

      if (!ticker || !esEstadoAlerta(decision)) return;
      if (normalizarEstado(decision) === normalizarEstado(estadoNotif)) return;

      // Reloj 1 hora
      if (fechaNotif) {
        const f = new Date(fechaNotif);
        if (!isNaN(f.getTime()) && hoy.getTime() - f.getTime() < UNA_HORA) return;
      }

      const analisisIA = obtenerAnalisisGemini({ nombre, ticker });

      let msg = `🔔 *ALERTA: ${decision}*\n`;
      msg += `⚠️ _Cambio de condición detectado_\n\n`;
      msg += `🏆 Puesto: *#${puesto}*\n`;
      msg += `🚀 *${nombre}* (${ticker})\n`;
      msg += `💰 Precio actual: ${Number(precioActual).toFixed(2)}${h.d}\n`;
      msg += `🎯 Precio ganga: ${Number(precioGanga).toFixed(2)}${h.d}\n`;
      msg += `🛡️ Desc. con margen: *${formatPct(descCon)}*\n`;
      msg += `📈 Desc. sin margen: ${formatPct(descSin)}\n\n`;
      msg += `💡 *Nota del Analista AI:*\n${analisisIA}\n\n`;
      msg += CONFIG.DISCLAIMER;

      if (ejecutarEnvio(msg)) {
        sheet.getRange(numFila, BCOLS.ESTADO_NOTIF + 1).setValue(decision);
        sheet.getRange(numFila, BCOLS.FECHA_NOTIF  + 1).setValue(new Date());
        Utilities.sleep(1500);
      }
    });
  });
}

/**
 * 3. RECORDATORIO NOCTURNO — 1 ganga USA + 1 exUSA, enfriamiento 3 días (21:00, L-V)
 */
function enviarRecordatorioAleatorio() {
  const hoy = new Date();
  if (hoy.getDay() === 0 || hoy.getDay() === 6) return;

  const frasesCierre = [
    "🌙 *Wall Street cierra...* Gangas persistentes en el radar:",
    "🔔 *Finaliza la sesión en Nueva York.* Empresas en zona de interés:",
    "📉 *Tras el cierre de Wall Street,* estas joyas siguen a tiro:",
    "☕ *Mercado en calma.* Repasamos las gangas del Búnker:"
  ];
  const saludo = frasesCierre[Math.floor(Math.random() * frasesCierre.length)];

  _enviarRecordatorio(saludo, "🔥 *REPASO DIARIO DE CIERRE*");
}

/**
 * 4. RECORDATORIO FIN DE SEMANA — 1 ganga USA + 1 exUSA, enfriamiento 3 días (sábado y domingo)
 */
function enviarRecordatorioFinDeSemana() {
  const hoy = new Date();
  if (hoy.getDay() !== 0 && hoy.getDay() !== 6) return;

  const frasesFinde = [
    "🛋️ *Fin de semana en el Búnker.* Gangas que no descansan:",
    "📅 *Repaso del fin de semana.* Empresas en zona ganga:",
    "🏖️ *Mercados cerrados, oportunidades abiertas.* Gangas del Búnker:",
    "☕ *Análisis de fin de semana.* Joyas que siguen a precio de derribo:"
  ];
  const saludo = frasesFinde[Math.floor(Math.random() * frasesFinde.length)];

  _enviarRecordatorio(saludo, "📅 *RECORDATORIO DE FIN DE SEMANA*");
}

/**
 * 5. RECORDATORIO SEMANAL — Lunes por la mañana, explicación del bot
 */
function enviarRecordatorioSemanal() {
  const hoy = new Date();
  if (hoy.getDay() !== 1) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.HOJA_USA);
  const celdaSemana = sheet.getRange("AL4");
  const fechaHoyStr = Utilities.formatDate(hoy, Session.getScriptTimeZone(), "dd/MM/yyyy");

  if (celdaSemana.getDisplayValue() === fechaHoyStr) return;

  const msg =
    `🤖 *BÚNKER DE INVERSIÓN v2.0 — Cómo funciona*\n\n` +
    `Solo aparecen empresas con *potencial positivo* (sin margen de seguridad), ordenadas por rendimiento con margen.\n\n` +
    `Pasan 2 filtros de cribado:\n` +
    `✅ Calidad (Moat: ROIC, márgenes, crecimiento)\n` +
    `✅ Balance (Net Debt/EBITDA por modelo)\n\n` +
    `Cada empresa se valora con *uno de 7 modelos* según su tipo: DCF, múltiplos, Graham, activos netos...\n\n` +
    `Solo las que superan todo llegan aquí.\n\n` +
    `🟢 = pasó el filtro como sólida (ANALIZAR)\n` +
    `❗ = pasó el filtro pero en vigilancia (VIGILAR)\n\n` +
    CONFIG.DISCLAIMER;

  if (ejecutarEnvio(msg)) {
    celdaSemana.setValue(fechaHoyStr);
  }
}

/**
 * Motor compartido para recordatorio nocturno y de fin de semana.
 * Máx 1 USA + 1 exUSA por día, enfriamiento de 3 días por empresa.
 */
function _enviarRecordatorio(saludo, cabecera) {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  const hoy = new Date();
  const fechaHoyStr = Utilities.formatDate(hoy, Session.getScriptTimeZone(), "dd/MM/yyyy");
  const TRES_DIAS   = 3 * 24 * 60 * 60 * 1000;

  const hojas = [
    { n: CONFIG.HOJA_USA,   e: "🇺🇸", d: "$", max: 1 },
    { n: CONFIG.HOJA_EXUSA, e: "🌍",  d: "€", max: 1 }
  ];

  const aEnviar = [];

  hojas.forEach(h => {
    const sheet         = ss.getSheetByName(h.n);
    const celdaContador = sheet.getRange("AJ4");
    const celdaFecha    = sheet.getRange("AK4");

    if (celdaFecha.getDisplayValue() !== fechaHoyStr) {
      celdaContador.setValue(0);
      celdaFecha.setValue(fechaHoyStr);
    }

    let contadorHoy = parseInt(celdaContador.getValue()) || 0;
    if (contadorHoy >= h.max) return;

    const ultimaFila = sheet.getLastRow();
    if (ultimaFila < 2) return;

    const data = sheet.getRange(2, 1, ultimaFila - 1, 22).getValues();

    const candidatas = data
      .map((fila, idx) => ({
        rowNum:        idx + 2,
        nombre:        fila[BCOLS.NOMBRE],
        ticker:        fila[BCOLS.TICKER],
        decision:      fila[BCOLS.DECISION],
        precioActual:  fila[BCOLS.PRECIO_ACTUAL],
        precioGanga:   fila[BCOLS.PRECIO_GANGA],
        descSin:       fila[BCOLS.DESC_SIN],
        descCon:       fila[BCOLS.DESC_CON],
        puesto:        fila[BCOLS.PUESTO],
        fechaUltGanga: fila[BCOLS.FECHA_ULT_GANGA],
        hoja: h
      }))
      .filter(e => {
        if (!e.ticker) return false;
        const puestoNum = Number(e.puesto);
        if (!e.puesto || isNaN(puestoNum) || puestoNum < 1) return false;
        const d = normalizarEstado(e.decision);
        const esGanga = d.includes("COMPRA GANGA") ||
                        Number(e.precioActual) <= Number(e.precioGanga) * 1.0001;
        if (!esGanga) return false;
        if (!e.fechaUltGanga) return true;
        return hoy.getTime() - new Date(e.fechaUltGanga).getTime() > TRES_DIAS;
      });

    while (candidatas.length > 0 && contadorHoy < h.max) {
      const idx = Math.floor(Math.random() * candidatas.length);
      aEnviar.push(candidatas.splice(idx, 1)[0]);
      contadorHoy++;
    }

    celdaContador.setValue(contadorHoy);
  });

  if (aEnviar.length === 0) return;

  ejecutarEnvio(saludo);
  Utilities.sleep(1000);

  aEnviar.forEach(sel => {
    const analisisIA = obtenerAnalisisGemini(sel);

    let msg = `${cabecera}\n\n`;
    msg += `🏆 Puesto: *#${sel.puesto}*\n`;
    msg += `🚀${sel.hoja.e} *${sel.nombre}* (${sel.ticker})${iconoFiltro(sel.decision)}\n`;
    msg += `💰 Precio actual: ${Number(sel.precioActual).toFixed(2)}${sel.hoja.d}\n`;
    msg += `🎯 Precio ganga: ${Number(sel.precioGanga).toFixed(2)}${sel.hoja.d}\n`;
    msg += `🛡️ Desc. con margen: *${formatPct(sel.descCon)}*\n`;
    msg += `📈 Desc. sin margen: ${formatPct(sel.descSin)}\n\n`;
    msg += `💡 *Analista AI:*\n${analisisIA}\n\n`;
    msg += CONFIG.DISCLAIMER;

    if (ejecutarEnvio(msg)) {
      ss.getSheetByName(sel.hoja.n)
        .getRange(sel.rowNum, BCOLS.FECHA_ULT_GANGA + 1)
        .setValue(new Date());
      Utilities.sleep(2000);
    }
  });
}

/**
 * MOTORES TÉCNICOS
 */
function obtenerAnalisisGemini(op) {
  const props = PropertiesService.getScriptProperties();

  const cacheKey = `GROQ_CACHE_${op.ticker}`;
  const cached = props.getProperty(cacheKey);
  if (cached) {
    try {
      const { text, ts } = JSON.parse(cached);
      if (Date.now() - ts < 24 * 60 * 60 * 1000) {
        console.log(`✓ Groq cache hit: ${op.ticker}`);
        return text;
      }
    } catch (e) {}
  }

  const apiKey = props.getProperty('GROQ_API_KEY1');
  if (!apiKey) {
    console.log("❌ GROQ_API_KEY1 no configurada");
    return "🏢 Análisis no disponible.\n🏰 Consulta el modelo directo.\n😨 Revisa noticias.";
  }

  const prompt =
    `Actúa como inversor experto explicando a un amateur la empresa ${op.nombre} (${op.ticker}). ` +
    `Responde EXACTAMENTE en este formato, máximo 15 palabras por punto:\n` +
    `🏢 A qué se dedican: [Resumen]\n` +
    `🏰 Por qué es un Castillo: [MOAT]\n` +
    `😨 Por qué hay miedo: [Riesgo hoy]\n` +
    `REGLA: Empieza directo en el primer emoji. Sin negritas. Sin texto adicional.`;

  const payload = {
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200
  };
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const res = UrlFetchApp.fetch("https://api.groq.com/openai/v1/chat/completions", options);
    const status = res.getResponseCode();

    if (status === 200) {
      const json = JSON.parse(res.getContentText());
      const texto = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
      if (texto) {
        console.log(`✓ Groq OK`);
        props.setProperty(cacheKey, JSON.stringify({ text: texto.trim(), ts: Date.now() }));
        return texto.trim();
      }
    } else if (status === 429) {
      console.log(`⚠️ Groq rate limitada: ${res.getContentText()}`);
    } else {
      console.log(`⚠️ Groq error ${status}: ${res.getContentText()}`);
    }
  } catch (e) {
    console.log(`⚠️ Groq excepción: ${e}`);
  }

  console.log("❌ Groq no disponible");
  return "🏢 Análisis no disponible.\n🏰 Consulta el modelo directo.\n😨 Revisa noticias.";
}

function ejecutarEnvio(mensaje) {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_TOKEN");
  if (!token) { console.log("❌ TELEGRAM_TOKEN no configurado"); return false; }
  try {
    const res = UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ chat_id: CONFIG.CHAT_ID, text: mensaje, parse_mode: "Markdown" })
    });
    return res.getResponseCode() === 200;
  } catch (e) {
    console.log("Error Telegram: " + e);
    return false;
  }
}

function testGemini() {
  const resultado = obtenerAnalisisGemini({ nombre: "Apple", ticker: "AAPL" });
  console.log(resultado);
}