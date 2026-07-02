/**
 * 00_DEV.js — MARCA DE ENTORNO DE DESARROLLO
 * ---------------------------------------------------------------------------
 * ⚠️ Este archivo SOLO debe existir en el proyecto Apps Script DEV
 *    ([DEV] Búnker de Inversión - Auditoría) y en la rama Git `dev-v3`.
 *    NUNCA desplegarlo a producción.
 *
 * Con MODO_DEV = true, las tres funciones de envío a Telegram
 * (ejecutarEnvio, enviarPrivado, enviarTelegram) NO envían nada:
 * escriben el mensaje en el registro (Logger) para poder inspeccionar
 * qué HABRÍA enviado el bot. Doble seguro junto a la ausencia de
 * TELEGRAM_TOKEN en las Script Properties de DEV.
 */
var MODO_DEV = true;
