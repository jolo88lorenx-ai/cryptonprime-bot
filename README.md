
# Deploy en Railway - cryptonprime bot 24/7

## PASO 1: Subir a GitHub
1. Crea repo en github.com/new llamado cryptonprime-bot
2. Sube estos 4 archivos: bot-cryptonprime.js, package.json, Dockerfile, .env-ejemplo

## PASO 2: Railway
1. Entra a railway.app -> New Project -> Deploy from GitHub Repo
2. Selecciona tu repo cryptonprime-bot
3. En Variables, agrega:
   - TWITCH_BOT_USERNAME = cryptonprime_bot
   - TWITCH_OAUTH = oauth:TU_TOKEN_REAL
   - TWITCH_CHANNEL = cryptonprime
   - WA_GROUP_SPAM_ID = 1203...@g.us
   - WA_GROUP_ANUNCIOS_ID = 1203...@g.us
4. Deploy.

## PASO 3: QR de WhatsApp
IMPORTANTE: whatsapp-web.js necesita escanear QR una vez.

Opcion facil: 
- En Railway ve a Deployments -> View Logs
- Te va a mostrar el QR en texto. Escanealo con tu numero secundario.

Si el QR es muy grande, usa en tu PC una vez para generar la sesion, y sube la carpeta .wwebjs_auth a Railway como Volume.

## PASO 4: Listo 24/7
Tu bot queda prendido. Cuando alguien spamee en twitch.tv/cryptonprime, se borra y cae en tu comunidad de WhatsApp.

Costo: Railway free tier te da 500hs/mes, alcanza para esto.

Soporte: si se cae la sesion de WA, solo re-deploy y escanea QR de nuevo.
