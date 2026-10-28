const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')
const express = require('express')

const app = express()
const PORT = process.env.PORT || 10000

app.get('/', (req, res) => {
  res.send('<h1>SLOW-GEE-SCE GHOST BOT 👻 IS ALIVE</h1><p>Cypher X Style - Powered by SLOW GEE</p>')
})
app.listen(PORT, () => console.log('SLOW-GEE GHOST LIVE ON ' + PORT))

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    browser: ['SLOW-GEE-GHOST', 'Chrome', '1.0']
  })
  sock.ev.on('creds.update', saveCreds)

  // PAIR CODE
  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      let code = await sock.requestPairingCode('254791536079')
      console.log('===== SLOW-GEE PAIR CODE: ' + code + ' =====')
    }, 4000)
  }

  // BOT ITASERVE HIZI:
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const body = m.message.conversation || m.message.extendedTextMessage?.text || ''
    if (!body.startsWith('.')) return

    const cmd = body.slice(1).split(' ')[0].toLowerCase()
    const from = m.key.remoteJid

    // 1. MENU - Ita-serve menu ya commands zote
    if (cmd === 'menu') {
      await sock.sendMessage(from, { text: `*SLOW-GEE GHOST MENU 👻 - CYPHER X STYLE*\n\n👻 .alive - Bot iko alive?\n👻 .ghost - Ghost mode\n👻 .owner - Owner info\n👻 .ping - Speed\n👻 .sc - Script\n👻 .sticker - Picha to sticker\n👻 .tagall - Tag group yote\n\n*POWERED BY SLOW GEE SCE*` }, { quoted: m })
    }
    if (cmd === 'alive') {
      await sock.sendMessage(from, { text: '*SLOW-GEE GHOST IS ALIVE* 👻🔥\nBot inafanya kazi 100%\nCypher X Edition' }, { quoted: m })
    }
    if (cmd === 'ghost') {
      await sock.sendMessage(from, { text: '👻 GHOST MODE ON... SLOW GEE IS WATCHING YOU...' }, { quoted: m })
    }
    if (cmd === 'owner') {
      await sock.sendMessage(from, { text: '*OWNER: SLOW GEE SCE*\nNumber: 254791536079\nGhost Bot Cypher X' }, { quoted: m })
    }
  })
}
startBot()
