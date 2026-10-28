const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const express = require('express')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 10000

app.get('/', (req, res) => {
  res.send('SLOW-GEE-SCE GHOST BOT IS ALIVE 🔥<br><br>Bot iko sawa! Angalia Logs kwenye Render kwa Pairing Code')
})

app.listen(PORT, () => console.log('Server running on', PORT))

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session')
  
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state,
    browser: ['SLOW-GEE-GHOST', 'Chrome', '1.0']
  })

  if (!sock.authState.creds.registered) {
    const phoneNumber = '254791536079' // <- WEKA NAMBA YAKO HAPA bila + mfano 254712345678
    setTimeout(async () => {
      try {
        let code = await sock.requestPairingCode(phoneNumber)
        console.log('=================================')
        console.log('PAIRING CODE YAKO: ', code)
        console.log('=================================')
        console.log('Nenda WhatsApp > Linked Devices > Link with phone number > weka code hapo juu')
      } catch (e) {
        console.log('Error getting pairing code:', e)
      }
    }, 3000)
  }

  sock.ev.on('creds.update', saveCreds)
  
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('BOT IMEWAKA! CONNECTED! ✅')
    }
  })
}

startBot()
