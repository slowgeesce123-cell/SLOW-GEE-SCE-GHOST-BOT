const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, delay } = require('@whiskeysockets/baileys');
const router = express.Router();

router.get('/', async (req, res) => {
  let num = req.query.number;
  if (!num) return res.status(400).send({ error: 'Weka ?number=254791536079' });
  num = num.replace(/[^0-9]/g, '');
  const dir = './temp-' + Date.now();
  fs.mkdirSync(dir, { recursive: true });
  try {
    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const sock = makeWASocket({
      version: [2, 3000, 1015901307],
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({})) },
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }).child({ level: "fatal" }),
      browser: Browsers.macOS("Safari")
    });
    sock.ev.on('creds.update', saveCreds);
    await delay(3000);
    let code = await sock.requestPairingCode(num);
    code = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log('CODE GENERATED:', code);
    res.send({ code: code });
    await delay(2000);
    sock.end();
  } catch (e) {
    console.log('PAIR ERROR:', e.message);
    if (!res.headersSent) res.status(500).send({ error: e.message });
  } finally {
    setTimeout(() => { try{ fs.rmSync(dir, {recursive:true, force:true}) }catch{} }, 5000);
  }
});
module.exports = router;
