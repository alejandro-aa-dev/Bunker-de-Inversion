function listarModelosDisponibles() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
  
  const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
  Logger.log(response.getContentText());
}