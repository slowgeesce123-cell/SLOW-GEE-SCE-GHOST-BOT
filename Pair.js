const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, delay } = require('@whiskeysockets/baileys');
const router = express.Router();
router.get('/', async (req, res) => {
  let num = req.query.number;
  if (!num) return res.status(400).send({ error: 'Number required' });
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
      browser: Browsers.macOS("Edge"),
      mobile: false
    });
    sock.ev.on('creds.update', saveCreds);
    await delay(3500);
    const code = await sock.requestPairingCode(num);
    console.log('PAIR CODE: ' + code + ' for ' + num);
    if (!res.headersSent) res.send({ code: code });
    await delay(30000);
    try{ sock.end(); }catch{}
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch (e) {
    console.log('PAIR ERROR', e);
    if (!res.headersSent) res.status(500).send({ error: e.message });
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
});
module.exports = router;
