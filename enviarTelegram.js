function enviarTelegram(chatIds, mensaje, token) {
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