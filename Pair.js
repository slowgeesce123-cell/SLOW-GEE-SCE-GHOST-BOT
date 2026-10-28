import express from 'express';
const router = express.Router();

// FIX - Dynamic import for Baileys ESM
const loadBaileys = async () => {
    const baileys = await import('@whiskeysockets/baileys');
    return baileys;
};

router.get('/', async (req, res) => {
    const num = req.query.number;
    if (!num) return res.status(400).json({ error: 'Number required' });

    try {
        const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, delay } = await loadBaileys();
        const { state, saveCreds } = await useMultiFileAuthState(`./session/${num}`);

        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, console.log),
            },
            browser: Browsers.ubuntu('Chrome'),
            printQRInTerminal: false,
        });

        if (!sock.authState.creds.registered) {
            await delay(1500);
            const code = await sock.requestPairingCode(num.replace(/[^0-9]/g, ''));
            res.json({ code: code });
        }

        sock.ev.on('creds.update', saveCreds);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
