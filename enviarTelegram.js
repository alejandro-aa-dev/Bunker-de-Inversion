function enviarTelegram(chatIds, mensaje, token) {
  // Guard de entorno: en DEV (MODO_DEV en 00_DEV.js) no se envía nada, solo se loguea.
  if (typeof MODO_DEV !== "undefined" && MODO_DEV) {
    Logger.log("[DEV] enviarTelegram bloqueado por MODO_DEV. Destinos: " + JSON.stringify(chatIds) + " Mensaje:\n" + mensaje);
    return;
  }
  if (!chatIds) {
    Logger.log("Error: chatIds no definido");
    return;
  }
  if (!Array.isArray(chatIds)) {
    chatIds = [chatIds]; // convierte a array si es un solo ID
  }
  if (!token) {
    Logger.log("Error: token no definido");
    return;
  }

  var url = "https://api.telegram.org/bot" + token + "/sendMessage";

  chatIds.forEach(function(id) {
    try {
      var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({
          chat_id: id,
          text: mensaje
        }),
        muteHttpExceptions: true
      };
      var res = UrlFetchApp.fetch(url, options);
      Logger.log("sendMessage -> " + res.getContentText());
    } catch (e) {
      Logger.log("Error enviando a ID " + id + ": " + e);
    }
  });
}