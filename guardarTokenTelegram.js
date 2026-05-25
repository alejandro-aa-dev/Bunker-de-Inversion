function guardarTokenTelegram() {
  var token = "TU_TOKEN_AQUI"; // pega aquí tu token de BotFather, ejecuta una vez y bórralo
  PropertiesService.getScriptProperties().setProperty("TELEGRAM_TOKEN", token);
}