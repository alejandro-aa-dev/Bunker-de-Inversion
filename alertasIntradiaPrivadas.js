/**
 * alertasIntradiaPrivadas.js
 * ---------------------------------------------------------------------------
 * Alertas PRIVADAS del "Búnker de Inversión" (cartera de Ale y Rubén).
 *
 * Expone:
 *   - comprobarAlertasIntradia()            → BLOQUE 1 (precio %) + BLOQUE 2 (valoración)
 *   - comprobarAlertasSemanalesMensuales()  → BLOQUE 3 (semanal / mensual)
 *   - instalarTriggerIntradia()             → trigger cada 30 min (idempotente)
 *   - instalarTriggerSemanalMensual()       → trigger diario 17:00 (idempotente)
 *
 * Reutiliza de otros archivos (NO se redefinen aquí):
 *   - enviarPrivado()                  (alertasPromediarSMA200.js)
 *   - CFG_SMA.DESTINATARIOS_PRIVADOS   (alertasPromediarSMA200.js)
 *   - CONFIG.DISCLAIMER / HOJA_USA / HOJA_EXUSA  (ALERTAS DE INVERSIÓN UNIFICADAS.js)
 *   - formatPct(), iconoFiltro()       (ALERTAS DE INVERSIÓN UNIFICADAS.js)
 *
 * NOTA: para BLOQUE 3 hace falta que la hoja "Alertas SMA200" tenga las
 * columnas L (Var% semana) y M (Var% mes). Fórmulas sugeridas:
 *   L2: =IFERROR((C2/GOOGLEFINANCE(B2,"price",TODAY()-7)-1)*100, 0)
 *   M2: =IFERROR((C2/GOOGLEFINANCE(B2,"price",TODAY()-30)-1)*100, 0)
 * ---------------------------------------------------------------------------
 */

// ===== Configuración local (solo lo propio de este módulo) =================
var CFG_INTRA = {
  ZONA: 'Europe/Madrid',
  HOJA_SMA: 'Alertas SMA200',

  // Ventana intradía (minutos desde medianoche, hora Madrid)
  DIA_INI: 1, DIA_FIN: 5,          // 1=lunes ... 5=viernes (ISO)
  HORA_INI_MIN: 14 * 60 + 30,      // 14:30
  HORA_FIN_MIN: 18 * 60 + 30,      // 18:30

  // --- Columnas hoja "Alertas SMA200" (0-indexed) ---
  S_ACCION: 0,   // A
  S_TICKER: 1,   // B
  S_PRECIO: 2,   // C
  S_VARDIA: 10,  // K
  S_VARSEM: 11,  // L
  S_VARMES: 12,  // M

  // --- Columnas hojas "Bunker de inversion *" (0-indexed) ---
  // (coinciden con BCOLS del archivo principal; se usan literales por claridad)
  B_NOMBRE: 1,    // B
  B_TICKER: 2,    // C
  B_DECISION: 4,  // E
  B_PRECIO: 6,    // G
  B_GANGA: 11,    // L
  B_DESC_SIN: 13, // N
  B_DESC_CON: 14, // O
  B_PUESTO: 16,   // Q

  // Umbrales escalonados
  CAIDA_DIA: [-5, -10, -15],     RESET_CAIDA_DIA: -3,
  SUBIDA_DIA: [5, 10, 15],       RESET_SUBIDA_DIA: 3,
  CAIDA_SEM: [-10, -20],         RESET_CAIDA_SEM: -5,
  SUBIDA_SEM: [10, 20],          RESET_SUBIDA_SEM: 5,
  CAIDA_MES: [-20, -30],         RESET_CAIDA_MES: -10,
  SUBIDA_MES: [20, 30],          RESET_SUBIDA_MES: 10,

  VALOR_COOLDOWN_MS: 4 * 60 * 60 * 1000  // 4 horas
};

// ===========================================================================
// BLOQUE 1 + BLOQUE 2 — Intradía (cada 30 min, 14:30-18:30 L-V)
// ===========================================================================
function comprobarAlertasIntradia() {
  if (!_intraEnHorario_()) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var props = PropertiesService.getScriptProperties();
  var divisas = _mapaDivisas_(ss);

  // ---------- BLOQUE 1: precio % del día ----------
  var hojaSMA = ss.getSheetByName(CFG_INTRA.HOJA_SMA);
  if (hojaSMA) {
    var datos = hojaSMA.getDataRange().getValues();
    for (var i = 2; i < datos.length; i++) {  // fila 1=título(0), fila 2=cabeceras(1), datos desde índice 2
      var f = datos[i];
      var ticker = String(f[CFG_INTRA.S_TICKER] || '').trim();
      if (!ticker) continue;

      var accion = String(f[CFG_INTRA.S_ACCION] || '').trim();
      var precio = _intraNum_(f[CFG_INTRA.S_PRECIO]);
      var varDia = _intraNum_(f[CFG_INTRA.S_VARDIA]);
      if (varDia === null) continue;
      var div = divisas[ticker] || '';

      // 1a. Caída del día
      var cae = _chequearBajada_(props, 'INTRA_CAIDA_' + ticker, varDia,
                                 CFG_INTRA.CAIDA_DIA, CFG_INTRA.RESET_CAIDA_DIA);
      if (cae !== null) {
        enviarPrivado(
          '📉 *CAÍDA SIGNIFICATIVA* — ' + accion + ' (' + ticker + ')\n' +
          '🔻 Bajada del ' + _fmt_(Math.abs(varDia)) + '% hoy\n' +
          '💰 Precio actual: ' + _fmt_(precio) + div + '\n' +
          '🛒 _Posible oportunidad de promediar. Revisa tu broker._\n\n' +
          CONFIG.DISCLAIMER);
        Utilities.sleep(1000);
      }

      // 1b. Subida del día
      var sube = _chequearSubida_(props, 'INTRA_SUBIDA_' + ticker, varDia,
                                  CFG_INTRA.SUBIDA_DIA, CFG_INTRA.RESET_SUBIDA_DIA);
      if (sube !== null) {
        enviarPrivado(
          '🚀 *RALLY SIGNIFICATIVO* — ' + accion + ' (' + ticker + ')\n' +
          '📈 Subida del +' + _fmt_(varDia) + '% hoy\n' +
          '💰 Precio actual: ' + _fmt_(precio) + div + '\n' +
          '📊 _La empresa lleva un buen día. Anótalo._\n\n' +
          CONFIG.DISCLAIMER);
        Utilities.sleep(1000);
      }
    }
  }

  // ---------- BLOQUE 2: valoración (hojas Bunker) ----------
  _intraBloqueValoracion_(ss, props, CONFIG.HOJA_USA, '$');
  _intraBloqueValoracion_(ss, props, CONFIG.HOJA_EXUSA, '€');
}

function _intraBloqueValoracion_(ss, props, nombreHoja, divisa) {
  var hoja = ss.getSheetByName(nombreHoja);
  if (!hoja) return;
  var vals = hoja.getDataRange().getValues();

  for (var r = 1; r < vals.length; r++) {     // desde fila 2 (index 1)
    var f = vals[r];
    var ticker = String(f[CFG_INTRA.B_TICKER] || '').trim();
    if (!ticker) continue;

    var decision = f[CFG_INTRA.B_DECISION];
    var estado = _detectarEstado_(decision);
    var claveEstado = 'INTRA_VALOR_' + ticker;
    var claveTs = 'INTRA_VALOR_TS_' + ticker;

    // Sin estado de compra → resetear anti-spam y continuar
    if (!estado) {
      if (props.getProperty(claveEstado)) props.setProperty(claveEstado, '');
      continue;
    }

    var prevRank = _rankEstado_(props.getProperty(claveEstado));

    if (estado.rank > prevRank) {
      // Entra en estado de compra o profundiza → posible aviso (con cooldown 4 h)
      var ts = Number(props.getProperty(claveTs) || 0);
      if (Date.now() - ts < CFG_INTRA.VALOR_COOLDOWN_MS) continue;

      var nombre = String(f[CFG_INTRA.B_NOMBRE] || '').trim();
      var precio = _intraNum_(f[CFG_INTRA.B_PRECIO]);
      var ganga = _intraNum_(f[CFG_INTRA.B_GANGA]);
      var puesto = f[CFG_INTRA.B_PUESTO];
      var icono = iconoFiltro(decision);

      enviarPrivado(
        '🎯 *' + estado.label + '* — ' + nombre + ' (' + ticker + ')' + icono + '\n\n' +
        '🏆 Puesto: #' + puesto + '\n' +
        '💰 Precio actual: ' + _fmt_(precio) + divisa + ' | Precio ganga: ' + _fmt_(ganga) + divisa + '\n' +
        '🛡️ Desc. con margen: *' + formatPct(f[CFG_INTRA.B_DESC_CON]) + '*\n' +
        '📈 Desc. sin margen: ' + formatPct(f[CFG_INTRA.B_DESC_SIN]) + '\n\n' +
        'Según el sistema de valoración de Ale, está en zona de compra 👇\n' +
        '🛒 _Revisa el broker y analiza si refuerzas posición._\n\n' +
        CONFIG.DISCLAIMER);

      props.setProperty(claveEstado, estado.key);
      props.setProperty(claveTs, String(Date.now()));
      Utilities.sleep(1000);

    } else if (estado.rank < prevRank) {
      // Bajó de nivel pero sigue siendo estado de compra: actualiza sin avisar
      props.setProperty(claveEstado, estado.key);
    }
  }
}

// ===========================================================================
// BLOQUE 3 — Semanal y mensual (una vez al día, 17:00 L-V)
// ===========================================================================
function comprobarAlertasSemanalesMensuales() {
  // Sin restricción de hora, pero solo en días laborables (L-V)
  var diaIso = Number(Utilities.formatDate(new Date(), CFG_INTRA.ZONA, 'u'));
  if (diaIso < CFG_INTRA.DIA_INI || diaIso > CFG_INTRA.DIA_FIN) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaSMA = ss.getSheetByName(CFG_INTRA.HOJA_SMA);
  if (!hojaSMA) return;

  var props = PropertiesService.getScriptProperties();
  var divisas = _mapaDivisas_(ss);
  var datos = hojaSMA.getDataRange().getValues();

  for (var i = 2; i < datos.length; i++) {  // fila 1=título(0), fila 2=cabeceras(1), datos desde índice 2
    var f = datos[i];
    var ticker = String(f[CFG_INTRA.S_TICKER] || '').trim();
    if (!ticker) continue;

    var accion = String(f[CFG_INTRA.S_ACCION] || '').trim();
    var precio = _intraNum_(f[CFG_INTRA.S_PRECIO]);
    var varSem = _intraNum_(f[CFG_INTRA.S_VARSEM]);
    var varMes = _intraNum_(f[CFG_INTRA.S_VARMES]);
    var div = divisas[ticker] || '';

    // --- Semanal ---
    if (varSem !== null) {
      if (_chequearBajada_(props, 'SEMANAL_CAIDA_' + ticker, varSem,
                           CFG_INTRA.CAIDA_SEM, CFG_INTRA.RESET_CAIDA_SEM) !== null) {
        enviarPrivado(
          '📉 *CAÍDA SEMANAL* — ' + accion + ' (' + ticker + ')\n' +
          '🔻 Lleva un ' + _fmt_(varSem) + '% esta semana\n' +
          '💰 Precio actual: ' + _fmt_(precio) + div + '\n' +
          '🔍 _Revisa si la tesis sigue intacta._\n\n' +
          CONFIG.DISCLAIMER);
        Utilities.sleep(1000);
      }
      if (_chequearSubida_(props, 'SEMANAL_SUBIDA_' + ticker, varSem,
                           CFG_INTRA.SUBIDA_SEM, CFG_INTRA.RESET_SUBIDA_SEM) !== null) {
        enviarPrivado(
          '🚀 *RALLY SEMANAL* — ' + accion + ' (' + ticker + ')\n' +
          '📈 Lleva un +' + _fmt_(varSem) + '% esta semana\n' +
          '💰 Precio actual: ' + _fmt_(precio) + div + '\n' +
          '📊 _Buen momento para revisar si sigue en rango._\n\n' +
          CONFIG.DISCLAIMER);
        Utilities.sleep(1000);
      }
    }

    // --- Mensual ---
    if (varMes !== null) {
      if (_chequearBajada_(props, 'MENSUAL_CAIDA_' + ticker, varMes,
                           CFG_INTRA.CAIDA_MES, CFG_INTRA.RESET_CAIDA_MES) !== null) {
        enviarPrivado(
          '📉 *CAÍDA MENSUAL* — ' + accion + ' (' + ticker + ')\n' +
          '🔻 Lleva un ' + _fmt_(varMes) + '% este mes\n' +
          '💰 Precio actual: ' + _fmt_(precio) + div + '\n' +
          '🔍 _Revisa si la tesis sigue intacta._\n\n' +
          CONFIG.DISCLAIMER);
        Utilities.sleep(1000);
      }
      if (_chequearSubida_(props, 'MENSUAL_SUBIDA_' + ticker, varMes,
                           CFG_INTRA.SUBIDA_MES, CFG_INTRA.RESET_SUBIDA_MES) !== null) {
        enviarPrivado(
          '🚀 *RALLY MENSUAL* — ' + accion + ' (' + ticker + ')\n' +
          '📈 Lleva un +' + _fmt_(varMes) + '% este mes\n' +
          '💰 Precio actual: ' + _fmt_(precio) + div + '\n' +
          '📊 _Buen momento para revisar si sigue en rango._\n\n' +
          CONFIG.DISCLAIMER);
        Utilities.sleep(1000);
      }
    }
  }
}

// ===========================================================================
// INSTALADORES DE TRIGGERS (idempotentes)
// ===========================================================================
function instalarTriggerIntradia() {
  if (_existeTrigger_('comprobarAlertasIntradia')) {
    Logger.log('[INTRA] Trigger intradía ya existe.');
    return;
  }
  ScriptApp.newTrigger('comprobarAlertasIntradia').timeBased().everyMinutes(30).create();
  Logger.log('[INTRA] Trigger creado: cada 30 min → comprobarAlertasIntradia().');
}

function instalarTriggerSemanalMensual() {
  if (_existeTrigger_('comprobarAlertasSemanalesMensuales')) {
    Logger.log('[INTRA] Trigger semanal/mensual ya existe.');
    return;
  }
  ScriptApp.newTrigger('comprobarAlertasSemanalesMensuales')
    .timeBased().everyDays(1).atHour(17).inTimezone(CFG_INTRA.ZONA).create();
  Logger.log('[INTRA] Trigger creado: diario 17:00 → comprobarAlertasSemanalesMensuales().');
}

// ===========================================================================
// HELPERS PRIVADOS (_intra* / _* para no colisionar con otros archivos)
// ===========================================================================

/** ¿L-V dentro de 14:30-18:30 hora Madrid? */
function _intraEnHorario_() {
  var ahora = new Date();
  var dia = Number(Utilities.formatDate(ahora, CFG_INTRA.ZONA, 'u'));
  if (dia < CFG_INTRA.DIA_INI || dia > CFG_INTRA.DIA_FIN) return false;
  var min = Number(Utilities.formatDate(ahora, CFG_INTRA.ZONA, 'HH')) * 60 +
            Number(Utilities.formatDate(ahora, CFG_INTRA.ZONA, 'mm'));
  return min >= CFG_INTRA.HORA_INI_MIN && min <= CFG_INTRA.HORA_FIN_MIN;
}

/**
 * Escalón de BAJADA. umbrales negativos, p.ej. [-5,-10,-15].
 * Avisa al cruzar un umbral más bajo (más negativo) que el ya avisado.
 * Reset (property = "") cuando valor >= reset. Devuelve el umbral avisado o null.
 */
function _chequearBajada_(props, clave, valor, umbrales, reset) {
  if (valor >= reset) { if (props.getProperty(clave)) props.setProperty(clave, ''); return null; }
  var alcanzado = null;
  for (var i = 0; i < umbrales.length; i++) if (valor <= umbrales[i]) alcanzado = umbrales[i];
  if (alcanzado === null) return null;
  var prev = props.getProperty(clave);
  var prevNum = prev ? Number(prev) : 0;
  if (alcanzado < prevNum) { props.setProperty(clave, String(alcanzado)); return alcanzado; }
  return null;
}

/**
 * Escalón de SUBIDA. umbrales positivos, p.ej. [5,10,15].
 * Avisa al cruzar un umbral más alto que el ya avisado.
 * Reset (property = "") cuando valor <= reset. Devuelve el umbral avisado o null.
 */
function _chequearSubida_(props, clave, valor, umbrales, reset) {
  if (valor <= reset) { if (props.getProperty(clave)) props.setProperty(clave, ''); return null; }
  var alcanzado = null;
  for (var i = 0; i < umbrales.length; i++) if (valor >= umbrales[i]) alcanzado = umbrales[i];
  if (alcanzado === null) return null;
  var prev = props.getProperty(clave);
  var prevNum = prev ? Number(prev) : 0;
  if (alcanzado > prevNum) { props.setProperty(clave, String(alcanzado)); return alcanzado; }
  return null;
}

/** Detecta estado de compra en la columna Decisión. Devuelve {key,rank,label} o null. */
function _detectarEstado_(decision) {
  var d = _norm_(decision);
  if (d.indexOf('COMPRA GANGA') >= 0)     return { key: 'GANGA',     rank: 3, label: 'PRECIO BAJO GANGA 🔥' };
  if (d.indexOf('BUENA COMPRA') >= 0)     return { key: 'BUENA',     rank: 2, label: 'BUENA COMPRA ✅' };
  if (d.indexOf('COMPRA RAZONABLE') >= 0) return { key: 'RAZONABLE', rank: 1, label: 'COMPRA RAZONABLE 📊' };
  return null;
}

function _rankEstado_(key) {
  if (key === 'GANGA') return 3;
  if (key === 'BUENA') return 2;
  if (key === 'RAZONABLE') return 1;
  return 0;
}

/** Normaliza: mayúsculas, sin tildes. */
function _norm_(s) {
  return String(s || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/** Mapa { ticker: '$'|'€' } a partir de las dos hojas Bunker. */
function _mapaDivisas_(ss) {
  var mapa = {};
  var fuentes = [[CONFIG.HOJA_USA, '$'], [CONFIG.HOJA_EXUSA, '€']];
  for (var s = 0; s < fuentes.length; s++) {
    var hoja = ss.getSheetByName(fuentes[s][0]);
    if (!hoja) continue;
    var vals = hoja.getDataRange().getValues();
    for (var r = 1; r < vals.length; r++) {
      var tk = String(vals[r][CFG_INTRA.B_TICKER] || '').trim();
      if (tk) mapa[tk] = fuentes[s][1];
    }
  }
  return mapa;
}

/** ¿Existe ya un trigger para la función dada? */
function _existeTrigger_(nombreFuncion) {
  var ts = ScriptApp.getProjectTriggers();
  for (var i = 0; i < ts.length; i++) if (ts[i].getHandlerFunction() === nombreFuncion) return true;
  return false;
}

/** Número tolerante (admite coma decimal y %). null si no válido. */
function _intraNum_(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (typeof v === 'number') return isNaN(v) ? null : v;
  var n = parseFloat(String(v).replace('%', '').replace(',', '.').trim());
  return isNaN(n) ? null : n;
}

/** Formatea número a máx. 2 decimales, en formato español (coma). */
function _fmt_(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return String(parseFloat(Number(n).toFixed(2))).replace('.', ',');
}
