
// bot-cryptonprime.js - Bot Anti-Spam Twitch -> WhatsApp para cryptonprime
// Instalacion: npm install tmi.js whatsapp-web.js qrcode-terminal dotenv
import tmi from 'tmi.js';
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
import dotenv from 'dotenv';
dotenv.config();

const { Client, LocalAuth } = pkg;

// === CONFIG PARA cryptonprime ===
const TWITCH_CHANNEL = 'cryptonprime'; // tu canal
const WA_GROUP_SPAM_ID = process.env.WA_GROUP_SPAM_ID || '1203xxx@g.us'; // Reemplazar con ID real de tu grupo LOGS
const WA_GROUP_ANUNCIOS_ID = process.env.WA_GROUP_ANUNCIOS_ID || '';

// Filtros - se sincronizan con tu panel web
let SPAM_KEYWORDS = [
  'discord.gg', 'discord.com/invite', 'instagram.com', 'tiktok.com',
  'seguime', 'follow me', 'wa.me', 'venta', 'cripto', 'http://', 'https://'
];

const CONFIG = {
  blockLinks: true,
  blockRepeat: true,
  blockNewAccounts: true,
  blockCaps: true,
  capsThreshold: 70,
  sensitivity: 75
};

console.log(`[CRYPTO] Iniciando bot para twitch.tv/${TWITCH_CHANNEL}`);

// 1. WhatsApp Client
const waClient = new Client({ 
  authStrategy: new LocalAuth({ clientId: "cryptonprime-bot" }),
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

waClient.on('qr', qr => {
  console.log('[WA] Escanea este QR con tu numero de bot:');
  qrcode.generate(qr, {small: true});
});

waClient.on('ready', () => {
  console.log('[WA] WhatsApp conectado! Listo para enviar a comunidad');
});

waClient.on('authenticated', () => console.log('[WA] Autenticado'));

// 2. Twitch Client
const twitchClient = new tmi.Client({
  options: { debug: false },
  identity: {
    username: process.env.TWITCH_BOT_USERNAME || 'cryptonprime_bot',
    password: process.env.TWITCH_OAUTH // oauth:xxxx
  },
  channels: [TWITCH_CHANNEL]
});

const recentMessages = new Map(); // para detectar spam repetido

function esSpam(mensaje, tags) {
  const lower = mensaje.toLowerCase();
  // 1. Keywords
  if (SPAM_KEYWORDS.some(k => lower.includes(k.toLowerCase()))) return { is: true, reason: 'Palabra clave bloqueada' };
  // 2. Links
  if (CONFIG.blockLinks && /(https?:\/\/|www\.|\.com|\.gg)/i.test(mensaje)) return { is: true, reason: 'Link externo' };
  // 3. Mayusculas
  if (CONFIG.blockCaps) {
    const mayus = (mensaje.match(/[A-Z]/g) || []).length;
    if (mensaje.length > 10 && (mayus / mensaje.length * 100) > CONFIG.capsThreshold) return { is: true, reason: 'Exceso de mayusculas' };
  }
  // 4. Repetido
  if (CONFIG.blockRepeat) {
    const key = `${tags.username}:${lower}`;
    const count = recentMessages.get(key) || 0;
    if (count >= 2) return { is: true, reason: 'Mensaje repetido (spam)' };
    recentMessages.set(key, count + 1);
    setTimeout(() => recentMessages.delete(key), 60000);
  }
  // 5. Muy largo
  if (mensaje.length > 250) return { is: true, reason: 'Mensaje muy largo' };
  return { is: false };
}

twitchClient.on('message', async (channel, tags, message, self) => {
  if(self) return;
  
  const check = esSpam(message, tags);
  if(check.is) {
    console.log(`[SPAM] ${tags.username}: ${message} | Motivo: ${check.reason}`);
    try {
      // Borra en Twitch (necesita ser mod)
      await twitchClient.deletemessage(channel, tags.id).catch(()=>{});
      await twitchClient.say(channel, `@${tags.username} tu mensaje fue movido al log de mods en WhatsApp por: ${check.reason} 😉`);

      // Manda a WhatsApp
      if (WA_GROUP_SPAM_ID && !WA_GROUP_SPAM_ID.includes('xxx')) {
        const textoWA = `🚨 *SPAM en Twitch*

*Usuario:* ${tags.username}
*Canal:* ${channel}
*Motivo:* ${check.reason}
*Mensaje:* ${message}
*Hora:* ${new Date().toLocaleString('es-AR')}

_Twitch.tv/${TWITCH_CHANNEL}_`;
        await waClient.sendMessage(WA_GROUP_SPAM_ID, textoWA);
      }
    } catch(e) { console.error(e); }
  }
});

// Evento EN VIVO -> Anuncia en WhatsApp
twitchClient.on('connected', () => {
  console.log(`[TWITCH] Conectado a #${TWITCH_CHANNEL}`);
});

// Para anunciar cuando prendes: lo conectamos via EventSub o manual
// Funcion para que llames cuando prendes stream (puedes llamarla desde Streamlabs o manualmente)
async function anunciarEnVivo(juego = '') {
  const msg = `🔴 *¡CRYPONPRIME EN VIVO!*

Estamos en Twitch jugando ${juego || 'en vivo'}.
Veni: https://twitch.tv/${TWITCH_CHANNEL}

#Twitch #EnVivo`;
  if (WA_GROUP_ANUNCIOS_ID) {
    await waClient.sendMessage(WA_GROUP_ANUNCIOS_ID, msg);
    console.log('[ANUNCIO] Mensaje de vivo enviado a WhatsApp');
  }
}

// Conectar todo
waClient.initialize();
twitchClient.connect();

// Exportar para usar con comando !vivo
export { anunciarEnVivo };
