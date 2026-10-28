const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, delay } = require('@whiskeysockets/baileys');

const router = express.Router();

router.get('/', async (req, res) => {
  let num = req.query.number;
  if (!num) return res.status(400).send({ error: 'Number required: /pair?number=2547XXXXXXX' });
  
  num = num.replace(/[^0-9]/g, '');
  const dir = './temp-' + num;
  
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const sock = makeWASocket({
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({})) },
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }).child({ level: "fatal" }),
      browser: Browsers.macOS("Safari"),
    });

    sock.ev.on('creds.update', saveCreds);
    
    await delay(3000);
    
    if (!sock.authState.creds.registered) {
      const code = await sock.requestPairingCode(num);
      console.log('CODE FOR ' + num + ' : ' + code);
      if (!res.headersSent) {
        res.send({ code: code, number: num, message: 'Weka hii code WhatsApp haraka! Inaisha sekunde 20' });
      }
      await delay(20000);
      sock.end();
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (e) {
    console.log(e);
    if (!res.headersSent) res.status(500).send({ error: 'Failed: ' + e.message + ' Jaribu tena' });
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
});

module.exports = router;
