/**
 * alertasIntradiaPrivadas.js
 * ---------------------------------------------------------------------------
 * Alertas PRIVADAS del "Búnker de Inversión" (cartera de Ale y Rubén).
 *
 * Expone:
 *   - comprobarAlertasIntradia()            → BLOQUE 1 (precio %) + BLOQUE 2 (valoración)
 *   - comprobarAlertasSemanalesMensuales()  → BLOQUE 3 (semanal / mensual)
 *   - comprobarAlertasRSI()                 → BLOQUE 4 (RSI sobreventa/sobrecompra)
 *   - instalarTriggerIntradia()             → trigger cada 30 min (idempotente)
 *   - instalarTriggerSemanalMensual()       → trigger diario 17:00 (idempotente)
 *   - instalarTriggerRSI()                  → trigger diario ~17:30 (idempotente)
 *   - testRSI()                             → prueba manual del cálculo de RSI
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

  // Hojas con layout A-Q (idéntico) que procesa el BLOQUE 4 (RSI + SMA200).
  // 'Alertas SMA200' = bünker grande; 'Otras Empresas2' = sistema de valoración
  // personal de Ale (empresas fuera del bünker). Para añadir otra hoja basta con
  // replicar el layout A-Q y meter su nombre aquí.
  HOJAS_RSI: ['Alertas SMA200', 'Otras Empresas2'],

  // Ventana intradía (minutos desde medianoche, hora Madrid)
  DIA_INI: 1, DIA_FIN: 5,          // 1=lunes ... 5=viernes (ISO)
  HORA_INI_MIN: 9 * 60,            // 9:00
  HORA_FIN_MIN: 21 * 60,           // 21:00

  // --- Columnas hoja "Alertas SMA200" (0-indexed) ---
  S_ACCION: 0,   // A
  S_TICKER: 1,   // B
  S_PRECIO: 2,   // C
  S_SMA200: 3,   // D — SMA200 (200 sesiones), define la tendencia de fondo
  S_VARDIA: 10,  // K
  S_VARSEM: 11,  // L
  S_VARMES: 12,  // M
  S_RSI: 13,        // N — RSI actual (escrito por Apps Script)
  S_RSI_ESTADO: 14, // O — NORMAL / SOBREVENTA / SOBRECOMPRA
  S_RSI_FECHA: 15,  // P — fecha/hora última actualización
  S_RSI_SENAL: 16,  // Q — ENTRADA / SALIDA / NEUTRAL

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

  VALOR_COOLDOWN_MS: 4 * 60 * 60 * 1000,  // 4 horas

  // --- BLOQUE 4: RSI ---
  RSI_PERIODO: 14,                         // RSI estándar de 14 sesiones
  RSI_SOBREVENTA: 30,                      // RSI < 30 → sobreventa
  RSI_SOBRECOMPRA: 70,                     // RSI > 70 → sobrecompra
  RSI_DIAS_HISTORICO: 150,                 // días naturales pedidos (~100 sesiones, para que el suavizado de Wilder converja como en TradingView)
  RSI_COOLDOWN_MS: 2 * 60 * 60 * 1000,     // 2 horas entre alertas del mismo ticker
  // Hoja oculta con una fórmula GOOGLEFINANCE PERSISTENTE por ticker (bloques de
  // 3 columnas). No borrar: las fórmulas escritas por script no se resuelven
  // dentro de la misma ejecución, así que se dejan vivas y se leen ya calculadas.
  RSI_HOJA_SCRATCH: '_scratchRSI'
};

// ===========================================================================
// BLOQUE 1 + BLOQUE 2 — Intradía (cada 30 min, 9:00-21:00 L-V)
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
// BLOQUE 4 — RSI sobreventa/sobrecompra (una vez al día, ~17:30 L-V)
// ===========================================================================
/**
 * Recorre TODAS las hojas de CFG_INTRA.HOJAS_RSI (bünker grande "Alertas SMA200"
 * + "Otras Empresas2", mismo layout A-Q), calcula el RSI(14) de cada ticker y
 * CRUZA el extremo del RSI con la tendencia de fondo (precio vs SMA200):
 *  - Sobreventa  + precio SOBRE SMA200 → 🟢 POSIBLE COMPRA (rebote en tendencia alcista)
 *  - Sobreventa  + precio BAJO  SMA200 → ⚠️ cuchillo cayendo (solo vigilar, no compra limpia)
 *  - Sobrecompra + precio BAJO  SMA200 → 🔴 POSIBLE VENTA / reducir (rebote agotado)
 *  - Sobrecompra + precio SOBRE SMA200 → ⬆️ fuerza alcista (sin señal clara, no precipitarse)
 *  - Vuelta a zona normal              → ℹ️ aviso informativo
 * Escribe N (RSI), O (estado), P (fecha) y Q (señal) en cada hoja.
 * Anti-spam: máx. 1 alerta por hoja+ticker cada 2 h (Script Properties RSI_ALERT_*).
 * OJO: usa GOOGLEFINANCE histórico vía hoja oculta → tarda unos segundos por ticker.
 */
function comprobarAlertasRSI() {
  // Solo días laborables (L-V)
  var diaIso = Number(Utilities.formatDate(new Date(), CFG_INTRA.ZONA, 'u'));
  if (diaIso < CFG_INTRA.DIA_INI || diaIso > CFG_INTRA.DIA_FIN) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var props = PropertiesService.getScriptProperties();
  var divisas = _mapaDivisas_(ss);

  // Recoge todas las hojas con layout A-Q (bünker grande + "Otras Empresas") y
  // junta TODOS sus tickers para asegurar las fórmulas GOOGLEFINANCE de una sola
  // pasada en la hoja scratch. La primera vez pueden no resolverse aún (ver
  // _asegurarFormulasRSI_); en la siguiente ejecución ya están calculadas.
  var hojasRSI = [];
  var todosTickers = [];
  for (var h = 0; h < CFG_INTRA.HOJAS_RSI.length; h++) {
    var nombreHojaRSI = CFG_INTRA.HOJAS_RSI[h];
    var hojaRSI = ss.getSheetByName(nombreHojaRSI);
    if (!hojaRSI) { Logger.log('[RSI] No existe la hoja: ' + nombreHojaRSI); continue; }
    var datosHoja = hojaRSI.getDataRange().getValues();
    hojasRSI.push({ nombre: nombreHojaRSI, hoja: hojaRSI, datos: datosHoja });
    for (var t = 2; t < datosHoja.length; t++) {
      var tk = String(datosHoja[t][CFG_INTRA.S_TICKER] || '').trim();
      if (tk) todosTickers.push(tk);
    }
  }
  if (!hojasRSI.length) return;
  _asegurarFormulasRSI_(todosTickers);

  // Procesa cada hoja con la misma lógica RSI + SMA200.
  for (var k = 0; k < hojasRSI.length; k++) {
    _procesarHojaRSI_(hojasRSI[k].nombre, hojasRSI[k].hoja, hojasRSI[k].datos, props, divisas);
  }
}

/**
 * Procesa UNA hoja de alertas con layout A-Q idéntico al de "Alertas SMA200":
 * calcula el RSI(14) de cada ticker, lo CRUZA con la tendencia de fondo (precio
 * vs SMA200) y, si cambia el estado RSI, envía aviso privado (anti-spam por
 * hoja+ticker, 2 h). Siempre actualiza las columnas N..Q de esa hoja.
 */
function _procesarHojaRSI_(nombreHoja, hoja, datos, props, divisas) {
  for (var i = 2; i < datos.length; i++) {  // fila 1=título(0), fila 2=cabeceras(1), datos desde índice 2
    var f = datos[i];
    var ticker = String(f[CFG_INTRA.S_TICKER] || '').trim();
    if (!ticker) continue;

    var res = calcularRSI(ticker);
    if (res.rsi === null) {
      // GOOGLEFINANCE falló o datos insuficientes: no tocar la fila (mantiene valores previos)
      Logger.log('[RSI] ' + nombreHoja + ' / ' + ticker + ': ' + res.error);
      continue;
    }

    var accion = String(f[CFG_INTRA.S_ACCION] || '').trim();
    var precio = _intraNum_(f[CFG_INTRA.S_PRECIO]);
    var varDia = _intraNum_(f[CFG_INTRA.S_VARDIA]);
    var div = divisas[ticker] || '';

    var estadoNuevo = determinarEstadoRSI(res.rsi);
    // Primera ejecución (columna O vacía): se parte de NORMAL para que una posición
    // ya en sobreventa/sobrecompra genere alerta inmediata.
    var estadoPrev = String(f[CFG_INTRA.S_RSI_ESTADO] || '').trim() || 'NORMAL';
    var senal = String(f[CFG_INTRA.S_RSI_SENAL] || '').trim();

    // Tendencia de fondo: precio vs SMA200 (columna D de la misma hoja)
    var sma = _intraNum_(f[CFG_INTRA.S_SMA200]);
    var tendencia = (precio !== null && sma !== null && sma > 0)
                    ? (precio >= sma ? 'ALCISTA' : 'BAJISTA') : null;

    if (estadoNuevo !== estadoPrev) {
      var lineaPrecio = '💰 Precio: ' + _fmt_(precio) + div + '\n' +
                        '📊 Var% día: ' + (varDia === null ? '—' : (varDia >= 0 ? '+' : '') + _fmt_(varDia) + '%') + '\n';
      var lineaTendencia = '';
      if (tendencia) {
        var distSma = (precio / sma - 1) * 100;
        lineaTendencia = '📉 SMA200: ' + _fmt_(sma) + div + ' → precio ' +
                         (tendencia === 'ALCISTA' ? 'POR ENCIMA' : 'POR DEBAJO') +
                         ' (' + (distSma >= 0 ? '+' : '') + _fmt_(distSma) + '%)\n';
      }
      var cabecera = '🏷️ ' + accion + ' (' + ticker + ')\n';
      var msg = null;

      if (estadoNuevo === 'SOBREVENTA') {
        if (tendencia === 'ALCISTA') {
          senal = 'POSIBLE COMPRA';
          msg = '🟢 *POSIBLE COMPRA* — sobreventa en tendencia alcista\n' +
                cabecera +
                '⬇️ RSI: *' + _fmt_(res.rsi) + '* (<' + CFG_INTRA.RSI_SOBREVENTA + ' → agotamiento vendedor)\n' +
                lineaTendencia + lineaPrecio +
                '🧭 _Sobreventa con el precio sobre su SMA200: buena relación riesgo/recompensa. Análisis propio y lo hablamos antes de entrar._\n\n' +
                CONFIG.DISCLAIMER;
        } else if (tendencia === 'BAJISTA') {
          senal = 'VIGILAR (CUCHILLO)';
          msg = '⚠️ *SOBREVENTA EN TENDENCIA BAJISTA* — cuidado\n' +
                cabecera +
                '⬇️ RSI: *' + _fmt_(res.rsi) + '* (<' + CFG_INTRA.RSI_SOBREVENTA + ')\n' +
                lineaTendencia + lineaPrecio +
                '🧭 _RSI en sobreventa PERO precio bajo su SMA200: posible cuchillo cayendo. NO es compra limpia, solo vigilar._\n\n' +
                CONFIG.DISCLAIMER;
        } else {
          senal = 'ENTRADA';
          msg = '⬇️ *RSI ALERTA — SOBREVENTA*\n' + cabecera +
                '📐 RSI: *' + _fmt_(res.rsi) + '* (<' + CFG_INTRA.RSI_SOBREVENTA + ')\n' +
                lineaPrecio +
                '⏰ _Posible REBOTE alcista. Sin dato de SMA200 para confirmar tendencia._\n\n' +
                CONFIG.DISCLAIMER;
        }
      } else if (estadoNuevo === 'SOBRECOMPRA') {
        if (tendencia === 'BAJISTA') {
          senal = 'POSIBLE VENTA';
          msg = '🔴 *POSIBLE VENTA / REDUCIR* — sobrecompra en tendencia bajista\n' +
                cabecera +
                '⬆️ RSI: *' + _fmt_(res.rsi) + '* (>' + CFG_INTRA.RSI_SOBRECOMPRA + ' → rebote agotándose)\n' +
                lineaTendencia + lineaPrecio +
                '🧭 _Sobrecompra con el precio bajo su SMA200: si la tesis ya no convence, buen momento para reducir. Lo hablamos antes._\n\n' +
                CONFIG.DISCLAIMER;
        } else if (tendencia === 'ALCISTA') {
          senal = 'FUERZA ALCISTA';
          msg = '⬆️ *SOBRECOMPRA EN TENDENCIA ALCISTA* — fuerza, no venta\n' +
                cabecera +
                '⬆️ RSI: *' + _fmt_(res.rsi) + '* (>' + CFG_INTRA.RSI_SOBRECOMPRA + ')\n' +
                lineaTendencia + lineaPrecio +
                '🧭 _RSI alto pero precio sobre su SMA200: la empresa va lanzada. Posible corrección a corto; ni comprar ni vender con prisas._\n\n' +
                CONFIG.DISCLAIMER;
        } else {
          senal = 'SALIDA';
          msg = '⬆️ *RSI ALERTA — SOBRECOMPRA*\n' + cabecera +
                '📐 RSI: *' + _fmt_(res.rsi) + '* (>' + CFG_INTRA.RSI_SOBRECOMPRA + ')\n' +
                lineaPrecio +
                '⏰ _Posible CORRECCIÓN bajista. Sin dato de SMA200 para confirmar tendencia._\n\n' +
                CONFIG.DISCLAIMER;
        }
      } else if (estadoNuevo === 'NORMAL' &&
                 (estadoPrev === 'SOBREVENTA' || estadoPrev === 'SOBRECOMPRA')) {
        senal = 'NEUTRAL';
        var transicion = estadoPrev === 'SOBREVENTA' ? 'Sobreventa → Normal' : 'Sobrecompra → Normal';
        var lectura = estadoPrev === 'SOBREVENTA' ? 'Recuperación en marcha.' : 'Corrección en marcha.';
        msg = 'ℹ️ *RSI — Cambio de estado*\n' +
              '🏷️ ' + accion + ' (' + ticker + ')\n' +
              '📐 RSI: ' + _fmt_(res.rsi) + ' (' + transicion + ')\n' +
              lineaPrecio +
              '_' + lectura + '_\n\n' +
              CONFIG.DISCLAIMER;
      }

      if (msg) {
        var clave = 'RSI_ALERT_' + nombreHoja + '_' + ticker;
        var ts = Number(props.getProperty(clave) || 0);
        if (Date.now() - ts >= CFG_INTRA.RSI_COOLDOWN_MS) {
          if (enviarPrivado(msg)) {
            props.setProperty(clave, String(Date.now()));
            Utilities.sleep(1000);
          }
        } else {
          Logger.log('[RSI] ' + nombreHoja + ' / ' + ticker + ': en cooldown, no se reenvía (se actualizan columnas).');
        }
      }
    }

    // Actualizar siempre N..Q (también cuando no hay transición ni alerta)
    var fechaStr = Utilities.formatDate(new Date(), CFG_INTRA.ZONA, 'dd/MM HH:mm');
    hoja.getRange(i + 1, CFG_INTRA.S_RSI + 1, 1, 4)
        .setValues([[res.rsi, estadoNuevo, fechaStr, senal]]);
  }
}

/**
 * RSI(14) con suavizado de Wilder, el mismo método que TradingView:
 * media simple sobre las primeras 14 variaciones como semilla y suavizado
 * exponencial (factor 1/14) sobre todo el resto del histórico (~100 sesiones).
 * Devuelve { rsi: número|null, error: string|null }.
 */
function calcularRSI(ticker) {
  try {
    var sh = _asegurarFormulasRSI_([ticker]);
    var cierres = _leerCierresRSI_(sh, ticker);
    // Si la fórmula acaba de escribirse puede tardar en resolver: reintentar
    for (var intento = 0; intento < 3 && cierres.length < CFG_INTRA.RSI_PERIODO + 1; intento++) {
      Utilities.sleep(2000);
      SpreadsheetApp.flush();
      cierres = _leerCierresRSI_(sh, ticker);
    }
    if (cierres.length < CFG_INTRA.RSI_PERIODO + 1) {
      return { rsi: null, error: 'Datos insuficientes (' + cierres.length + ' cierres). ' +
               'Si la fórmula de ' + CFG_INTRA.RSI_HOJA_SCRATCH + ' es nueva, reintenta en unos minutos.' };
    }
    var n = CFG_INTRA.RSI_PERIODO;
    var cambios = [];
    for (var i = 1; i < cierres.length; i++) cambios.push(cierres[i] - cierres[i - 1]);

    // Semilla: media simple de las primeras n variaciones
    var promGan = 0, promPer = 0;
    for (var s = 0; s < n; s++) {
      if (cambios[s] > 0) promGan += cambios[s];
      else promPer += -cambios[s];
    }
    promGan /= n;
    promPer /= n;

    // Suavizado de Wilder sobre el resto del histórico
    for (var w = n; w < cambios.length; w++) {
      promGan = (promGan * (n - 1) + (cambios[w] > 0 ? cambios[w] : 0)) / n;
      promPer = (promPer * (n - 1) + (cambios[w] < 0 ? -cambios[w] : 0)) / n;
    }

    var rsi = (promPer === 0) ? 100 : 100 - (100 / (1 + promGan / promPer));
    return { rsi: Math.round(rsi * 100) / 100, error: null };
  } catch (e) {
    return { rsi: null, error: String(e) };
  }
}

/** Clasifica el RSI. 30 y 70 exactos cuentan como NORMAL. */
function determinarEstadoRSI(rsi) {
  if (rsi === null || rsi === undefined || isNaN(rsi)) return 'SIN_DATOS';
  if (rsi < CFG_INTRA.RSI_SOBREVENTA) return 'SOBREVENTA';
  if (rsi > CFG_INTRA.RSI_SOBRECOMPRA) return 'SOBRECOMPRA';
  return 'NORMAL';
}

/** Devuelve (creándola oculta si hace falta) la hoja scratch del RSI. */
function _scratchRSI_(ss) {
  var sh = ss.getSheetByName(CFG_INTRA.RSI_HOJA_SCRATCH);
  if (!sh) {
    sh = ss.insertSheet(CFG_INTRA.RSI_HOJA_SCRATCH);
    sh.hideSheet();
  }
  return sh;
}

/**
 * Columna base (1-indexed) del bloque de un ticker en la hoja scratch, o -1.
 * Cada bloque ocupa 3 columnas: etiqueta+fecha | cierre | (separador).
 */
function _bloqueRSI_(sh, ticker) {
  var ultCol = sh.getLastColumn();
  if (!ultCol) return -1;
  var etiquetas = sh.getRange(1, 1, 1, ultCol).getValues()[0];
  for (var c = 0; c < etiquetas.length; c += 3) {
    if (String(etiquetas[c]).trim() === ticker) return c + 1;
  }
  return -1;
}

/**
 * Garantiza que cada ticker tenga su fórmula GOOGLEFINANCE viva en la hoja
 * scratch. Las fórmulas son PERSISTENTES: las escritas por script no se
 * resuelven dentro de la misma ejecución (quedan en "Loading..." hasta que el
 * script termina), así que se dejan fijas para que Sheets las mantenga
 * calculadas y las siguientes ejecuciones lean valores al instante.
 * Estructura por bloque (colBase): fila 1 = ticker, fila 2 = fórmula
 * (cabecera Date|Close), filas 3+ = datos.
 */
function _asegurarFormulasRSI_(tickers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = _scratchRSI_(ss);

  var ultCol = sh.getLastColumn();
  var nBloques = ultCol ? Math.ceil(ultCol / 3) : 0;
  var nuevos = false;

  for (var i = 0; i < tickers.length; i++) {
    var colBase = _bloqueRSI_(sh, tickers[i]);
    if (colBase < 0) {
      colBase = nBloques * 3 + 1;
      if (sh.getMaxColumns() < colBase + 1) {
        sh.insertColumnsAfter(sh.getMaxColumns(), colBase + 1 - sh.getMaxColumns());
      }
      sh.getRange(1, colBase).setValue(tickers[i]);
      nBloques++;
    }
    var celdaFormula = sh.getRange(2, colBase);
    var fActual = celdaFormula.getFormula();
    // (Re)escribir si falta la fórmula, quedó en #ERROR (p.ej. por separador de
    // argumentos equivocado para el idioma de la hoja) o pide un histórico
    // distinto al configurado en RSI_DIAS_HISTORICO
    if (!fActual ||
        String(celdaFormula.getDisplayValue()).indexOf('#ERROR') === 0 ||
        fActual.indexOf('TODAY()-' + CFG_INTRA.RSI_DIAS_HISTORICO) < 0) {
      _escribirFormulaGF_(celdaFormula, tickers[i]);
      nuevos = true;
    }
  }
  if (nuevos) {
    SpreadsheetApp.flush();
    Utilities.sleep(5000);   // margen por si GOOGLEFINANCE llega a resolver en esta ejecución
  }
  return sh;
}

/**
 * Escribe la fórmula GOOGLEFINANCE probando el separador de argumentos.
 * setFormula NO traduce el separador al idioma de la hoja: en una hoja en
 * español los argumentos van con ";" y la coma deja la celda en #ERROR.
 * Se prueba el separador memorizado (Script Properties); si la celda queda en
 * #ERROR se reescribe con el otro y se memoriza el que funcionó.
 */
function _escribirFormulaGF_(celda, ticker) {
  var props = PropertiesService.getScriptProperties();
  var sep = props.getProperty('RSI_SEP_FORMULA') || ';';   // primera opción: ';' (hoja en español)
  celda.setFormula(_formulaGF_(ticker, sep));
  SpreadsheetApp.flush();
  if (String(celda.getDisplayValue()).indexOf('#ERROR') === 0) {
    sep = (sep === ';') ? ',' : ';';
    celda.setFormula(_formulaGF_(ticker, sep));
    SpreadsheetApp.flush();
    if (String(celda.getDisplayValue()).indexOf('#ERROR') === 0) {
      Logger.log('[RSI] No se pudo escribir la fórmula GOOGLEFINANCE para ' + ticker);
      return;
    }
  }
  props.setProperty('RSI_SEP_FORMULA', sep);
}

function _formulaGF_(ticker, sep) {
  return '=GOOGLEFINANCE("' + ticker + '"' + sep + '"close"' + sep +
         'TODAY()-' + CFG_INTRA.RSI_DIAS_HISTORICO + sep + 'TODAY())';
}

/** Lee los cierres ya resueltos del bloque de un ticker (antiguos primero). */
function _leerCierresRSI_(sh, ticker) {
  var colBase = _bloqueRSI_(sh, ticker);
  if (colBase < 0) return [];
  var nFilas = sh.getLastRow() - 2;                  // datos desde fila 3
  if (nFilas < 1) return [];
  var vals = sh.getRange(3, colBase + 1, nFilas, 1).getValues();  // columna de cierres
  var cierres = [];
  for (var r = 0; r < vals.length; r++) {
    var v = vals[r][0];
    // Solo cierres POSITIVOS: GOOGLEFINANCE a veces cuela filas con 0 al final
    // de la tabla, y un 0 simula una caída del 100% que hunde el RSI.
    if (typeof v === 'number' && !isNaN(v) && v > 0) cierres.push(v);
  }
  return cierres;
}

/**
 * DIAGNÓSTICO: muestra en el registro, por cada ticker de la hoja scratch,
 * los últimos 15 cierres crudos (fecha=valor) y el RSI que sale de ellos.
 * Útil para comparar con TradingView si algún RSI no cuadra.
 */
function verCierresRSI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CFG_INTRA.RSI_HOJA_SCRATCH);
  if (!sh) { Logger.log('No existe la hoja ' + CFG_INTRA.RSI_HOJA_SCRATCH); return; }
  var ultCol = sh.getLastColumn();
  if (!ultCol) { Logger.log('Hoja scratch vacía.'); return; }
  var etiquetas = sh.getRange(1, 1, 1, ultCol).getValues()[0];
  var nFilas = sh.getLastRow() - 2;
  if (nFilas < 1) { Logger.log('Sin datos en la hoja scratch.'); return; }

  for (var c = 0; c < etiquetas.length; c += 3) {
    var ticker = String(etiquetas[c]).trim();
    if (!ticker) continue;
    var vals = sh.getRange(3, c + 1, nFilas, 2).getValues();   // fecha | cierre
    var filas = [];
    for (var r = 0; r < vals.length; r++) {
      var v = vals[r][1];
      if (typeof v === 'number' && !isNaN(v)) {               // sin filtro >0: queremos VER los ceros
        var fch = vals[r][0];
        var fStr = (fch instanceof Date) ? Utilities.formatDate(fch, CFG_INTRA.ZONA, 'dd/MM') : String(fch);
        filas.push(fStr + '=' + v);
      }
    }
    var res = calcularRSI(ticker);
    Logger.log(ticker + ' → RSI ' + res.rsi + (res.error ? ' (' + res.error + ')' : '') +
               ' | últimos ' + Math.min(filas.length, CFG_INTRA.RSI_PERIODO + 1) + ' cierres: ' +
               filas.slice(-(CFG_INTRA.RSI_PERIODO + 1)).join(', '));
  }
}

/**
 * Prueba manual: calcula el RSI de un par de tickers y lo muestra en el
 * registro. Compara con TradingView (margen razonable: ±2 puntos).
 */
function testRSI() {
  ['AAPL', 'MSFT'].forEach(function (tk) {
    var r = calcularRSI(tk);
    Logger.log(tk + ' → RSI: ' + r.rsi +
               (r.error ? ' | error: ' + r.error : '') +
               ' | Estado: ' + determinarEstadoRSI(r.rsi));
  });
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

// ===========================================================================
// HORARIO OPERATIVO — sin ejecuciones de 00:00 a 08:00
// Apps Script NO permite limitar un trigger everyMinutes() a una franja: se
// dispara 24/7 y cada disparo cuenta como ejecución (un return interno NO lo
// evita). Por eso CREAMOS los triggers de alta frecuencia por la mañana y los
// BORRAMOS por la noche, con dos triggers diarios de orquestación.
// ▶ Ejecuta configurarHorarioOperativo() UNA vez para instalar todo.
// ===========================================================================
function configurarHorarioOperativo() {
  // Limpia triggers previos (alta frecuencia + orquestación) para no duplicar.
  _borrarTriggersPorNombre_([
    'comprobarAlertasIntradia',
    'comprobarAlertasIndividuales',
    'activarTriggersDiurnos',
    'desactivarTriggersNocturnos'
  ]);

  // Orquestación diaria (hora Madrid): ON a las 08:00, OFF a las 23:00.
  // OFF a las 23:00 (no a las 00:00) para que la franja 00:00-08:00 quede con
  // CERO ejecuciones; a esa hora todos los mercados del bünker ya cerraron.
  ScriptApp.newTrigger('activarTriggersDiurnos')
    .timeBased().everyDays(1).atHour(8).inTimezone(CFG_INTRA.ZONA).create();
  ScriptApp.newTrigger('desactivarTriggersNocturnos')
    .timeBased().everyDays(1).atHour(23).inTimezone(CFG_INTRA.ZONA).create();

  // Estado inicial según la hora actual (franja activa: 08:00 ≤ h < 23:00).
  var hora = Number(Utilities.formatDate(new Date(), CFG_INTRA.ZONA, 'HH'));
  if (hora >= 8 && hora < 23) {
    activarTriggersDiurnos();
    Logger.log('[HORARIO] Configurado. Franja diurna: alta frecuencia ACTIVA.');
  } else {
    Logger.log('[HORARIO] Configurado. Fuera de franja (23:00-08:00): alta frecuencia APAGADA hasta las 08:00.');
  }
}

/** Crea los triggers de alta frecuencia si no existen (franja 08:00-23:00). */
function activarTriggersDiurnos() {
  if (!_existeTrigger_('comprobarAlertasIntradia')) {
    ScriptApp.newTrigger('comprobarAlertasIntradia').timeBased().everyMinutes(30).create();
    Logger.log('[HORARIO] Creado trigger: comprobarAlertasIntradia (cada 30 min).');
  }
  if (!_existeTrigger_('comprobarAlertasIndividuales')) {
    ScriptApp.newTrigger('comprobarAlertasIndividuales').timeBased().everyMinutes(15).create();
    Logger.log('[HORARIO] Creado trigger: comprobarAlertasIndividuales (cada 15 min).');
  }
}

/** Borra los triggers de alta frecuencia (franja nocturna 23:00-08:00). */
function desactivarTriggersNocturnos() {
  _borrarTriggersPorNombre_(['comprobarAlertasIntradia', 'comprobarAlertasIndividuales']);
  Logger.log('[HORARIO] Eliminados triggers de alta frecuencia (franja nocturna).');
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

function instalarTriggerRSI() {
  if (_existeTrigger_('comprobarAlertasRSI')) {
    Logger.log('[RSI] Trigger RSI ya existe.');
    return;
  }
  // nearMinute(30) apunta a las ~17:30 (Apps Script da margen de ±15 min)
  ScriptApp.newTrigger('comprobarAlertasRSI')
    .timeBased().everyDays(1).atHour(17).nearMinute(30).inTimezone(CFG_INTRA.ZONA).create();
  Logger.log('[RSI] Trigger creado: diario ~17:30 → comprobarAlertasRSI().');
}

// ===========================================================================
// HELPERS PRIVADOS (_intra* / _* para no colisionar con otros archivos)
// ===========================================================================

/** ¿L-V dentro de 9:00-21:00 hora Madrid? */
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

/**
 * Muestra en el registro el estado actual del anti-spam de alertas intradía.
 * Ejecútala manualmente desde el editor de Apps Script cuando quieras.
 */
function verEstadoAntiSpam() {
  var props = PropertiesService.getScriptProperties().getProperties();
  var prefijos = ['INTRA_', 'SEMANAL_', 'MENSUAL_', 'RSI_'];
  var claves = Object.keys(props).filter(function(k) {
    return prefijos.some(function(p) { return k.indexOf(p) === 0; });
  }).sort();
  if (!claves.length) { Logger.log('Anti-spam vacío (ninguna alerta enviada aún).'); return; }
  Logger.log('=== Estado anti-spam alertas privadas ===');
  claves.forEach(function(k) { Logger.log(k + ' = ' + props[k]); });
}

/** ¿Existe ya un trigger para la función dada? */
function _existeTrigger_(nombreFuncion) {
  var ts = ScriptApp.getProjectTriggers();
  for (var i = 0; i < ts.length; i++) if (ts[i].getHandlerFunction() === nombreFuncion) return true;
  return false;
}

/** Borra todos los triggers cuya función esté en la lista dada. */
function _borrarTriggersPorNombre_(nombres) {
  var ts = ScriptApp.getProjectTriggers();
  for (var i = 0; i < ts.length; i++) {
    if (nombres.indexOf(ts[i].getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(ts[i]);
  }
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
