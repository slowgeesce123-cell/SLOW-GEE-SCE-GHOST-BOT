const express = require('express');
const router = express.Router();
const fs = require('fs');
const pino = require('pino');

router.get('/', async (req, res) => {
    const num = req.query.number;
    if (!num) return res.status(400).send({ error: "Number required" });

    try {
        // FIX - Baileys ni ESM sasa
        const baileys = await import('@whiskeysockets/baileys');
        const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, delay } = baileys;

        const dir = `./session/${num.replace(/[^0-9]/g, '')}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(dir);

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({ level: "silent" })),
            },
            browser: Browsers.ubuntu("Chrome"),
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
        });

        if (!sock.authState.creds.registered) {
            await delay(1500);
            const code = await sock.requestPairingCode(num.replace(/[^0-9]/g, ''));
            if (!res.headersSent) res.send({ code: code });
        }

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (s) => {
            if (s.connection === 'open') {
                await delay(5000);
                try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
                try { sock.end(); } catch {}
            }
        });

    } catch (e) {
        console.log(e);
        if (!res.headersSent) res.status(500).send({ error: e.message });
    }
});

module.exports = router;
