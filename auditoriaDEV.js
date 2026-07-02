/**
 * auditoriaDEV.js — HERRAMIENTA DE AUDITORÍA (Fase 0B)
 * ---------------------------------------------------------------------------
 * Solo existe en DEV (rama dev-v3). NO altera la lógica del Búnker: solo lee
 * y escribe su informe en la pestaña "_fotoSistema".
 *
 * fotoDelSistema() — ejecutar a mano desde el editor de Apps Script.
 * Vuelca: metadatos del libro, inventario de hojas, triggers instalados y
 * Script Properties (secretos enmascarados). Es la "foto" verificable del
 * estado del proyecto en un momento dado.
 */
function fotoDelSistema() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var filas = [];
  var ahora = Utilities.formatDate(new Date(), 'Europe/Madrid', 'dd/MM/yyyy HH:mm:ss');

  filas.push(['FOTO DEL SISTEMA', ahora]);
  filas.push(['Spreadsheet', ss.getName()]);
  filas.push(['Id', ss.getId()]);
  filas.push(['Zona horaria', ss.getSpreadsheetTimeZone()]);
  filas.push(['Locale', ss.getSpreadsheetLocale()]);
  filas.push(['MODO_DEV activo', String(typeof MODO_DEV !== 'undefined' && MODO_DEV)]);
  filas.push(['', '']);

  filas.push(['— HOJAS —', '']);
  ss.getSheets().forEach(function (sh) {
    filas.push([
      sh.getName(),
      (sh.isSheetHidden() ? 'oculta' : 'visible') + ' · ' + sh.getLastRow() + ' filas x ' + sh.getLastColumn() + ' cols'
    ]);
  });
  filas.push(['', '']);

  filas.push(['— TRIGGERS INSTALADOS —', '']);
  var ts = ScriptApp.getProjectTriggers();
  if (!ts.length) filas.push(['(ninguno)', '']);
  ts.forEach(function (t) {
    filas.push([t.getHandlerFunction(), String(t.getEventType())]);
  });
  filas.push(['', '']);

  filas.push(['— SCRIPT PROPERTIES —', '']);
  var props = PropertiesService.getScriptProperties().getProperties();
  var claves = Object.keys(props).sort();
  if (!claves.length) filas.push(['(vacías)', '']);
  claves.forEach(function (k) {
    var v = String(props[k]);
    // Enmascarar credenciales: solo longitud, nunca el valor
    if (/TOKEN|KEY|SECRET/i.test(k)) v = '••• (' + v.length + ' caracteres)';
    filas.push([k, v.slice(0, 150)]);
  });

  var sh = ss.getSheetByName('_fotoSistema') || ss.insertSheet('_fotoSistema');
  sh.clearContents();
  sh.getRange(1, 1, filas.length, 2).setValues(filas);
  Logger.log('Foto del sistema escrita en "_fotoSistema" (' + filas.length + ' filas).');
}
