const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, delay, DisconnectReason } = require('@whiskeysockets/baileys');
const router = express.Router();

router.get('/', async (req, res) => {
  let num = req.query.number;
  if (!num) return res.status(400).send({ error: 'Number required ?number=2547...' });
  num = num.replace(/[^0-9]/g, '');
  const dir = './temp-' + Date.now();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let sent = false;
  const sendCode = (code) => {
    if (!sent && !res.headersSent) {
      sent = true;
      res.send({ code: code, number: num, message: 'Copy haraka! 60 sec' });
    }
  };

  try {
    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const sock = makeWASocket({
      version: [2, 3000, 1015901307],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
      },
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }).child({ level: "fatal" }),
      browser: Browsers.macOS("Safari"),
      syncFullHistory: false,
      markOnlineOnConnect: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (u) => {
      const { connection, lastDisconnect } = u;
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log('Closed Reason:', reason, lastDisconnect?.error);
        if (!sent && !res.headersSent) {
          res.status(500).send({ error: 'Connection Closed - Jaribu tena, WhatsApp inazidiwa. Subiri 10 sec' });
        }
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
      }
    });

    // Ngoja kidogo socket i-initialize
    await delay(4000);

    if (!sock.authState.creds.registered) {
      console.log('Requesting code for ' + num);
      let code = await sock.requestPairingCode(num);
      code = code?.match(/.{1,4}/g)?.join('-') || code;
      console.log('CODE: ' + code);
      sendCode(code);
      
      await delay(60000); // Acha 60 sec uandike
      try { sock.end(); } catch {}
    }

  } catch (e) {
    console.log('ERROR PAIR:', e.message, e.stack);
    if (!res.headersSent) {
      res.status(500).send({ error: e.message + ' - Jaribu tena' });
    }
  } finally {
    try { if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
});

module.exports = router;
