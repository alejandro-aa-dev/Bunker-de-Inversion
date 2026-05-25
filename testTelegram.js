function diagnosticoTelegram() {

var token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_TOKEN");

Logger.log("TOKEN: " + token);

// 1️⃣ Comprobar bot
var urlBot = "https://api.telegram.org/bot"+token+"/getMe";
var resBot = UrlFetchApp.fetch(urlBot);
Logger.log("getMe -> " + resBot.getContentText());

// 2️⃣ Ver chats que han hablado con el bot
var urlUpdates = "https://api.telegram.org/bot"+token+"/getUpdates";
var resUpdates = UrlFetchApp.fetch(urlUpdates);
Logger.log("getUpdates -> " + resUpdates.getContentText());

// 3️⃣ Probar envío directo
var chatId = 1193956123;

var urlSend = "https://api.telegram.org/bot"+token+"/sendMessage";

var payload = {
  chat_id: chatId,
  text: "DIAGNOSTICO OK"
};

var options = {
  method: "post",
  contentType: "application/json",
  payload: JSON.stringify(payload),
  muteHttpExceptions: true
};

var resSend = UrlFetchApp.fetch(urlSend, options);

Logger.log("sendMessage -> " + resSend.getContentText());

}