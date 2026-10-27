const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const P = require('pino')
const fs = require('fs')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth')
    
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['SLOW-GEE-GHOST', 'Chrome', '1.0']
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connection closed, reconnecting:', shouldReconnect)
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('✅ SLOW-GEE-SCE GHOST BOT IS ONLINE!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if(!m.message) return
        const msg = m.message.conversation || m.message.extendedTextMessage?.text || ''
        const from = m.key.remoteJid

        if(!msg) return

        // Ghost Mode - Invisible
        await sock.readMessages([m.key])
        
        if(msg.toLowerCase() === '.ping'){
            await sock.sendMessage(from, { text: '👻 *SLOW-GEE-SCE GHOST BOT*\n\nPong! 200ms\nOnline ✅' })
        }
        if(msg.toLowerCase() === '.menu'){
            await sock.sendMessage(from, { text: `*👻 SLOW-GEE-SCE GHOST BOT MENU*

.ping - Check bot speed
.menu - This menu
.ghost on - Hide your online
.alive - Show bot is alive
.owner - My owner

*GHOST MODE ACTIVE* - No one sees you online!` })
        }
        if(msg.toLowerCase() === '.alive'){
            await sock.sendMessage(from, { text: '👻 I am alive! SLOW-GEE-SCE GHOST is watching...' })
        }
        if(msg.toLowerCase() === '.owner'){
            await sock.sendMessage(from, { text: '👑 Owner: SLOW-GEE SCE\n📍 Ghost Mode Bot' })
        }
    })
}

startBot()
