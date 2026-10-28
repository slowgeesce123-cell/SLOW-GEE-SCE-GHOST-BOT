const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, delay } = require('@whiskeysockets/baileys');
const router = express.Router();

router.get('/', async (req, res) => {
  let num = req.query.number;
  if (!num) return res.status(400).send({ error: 'Weka ?number=2547...' });
  num = num.replace(/[^0-9]/g, '');
  console.log('PAIR REQUEST for:', num);
  
  const dir = './auth-' + Date.now();
  fs.mkdirSync(dir, { recursive: true });
  
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
      browser: Browsers.ubuntu("Chrome"),
      markOnlineOnConnect: false,
      syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);
    
    await delay(5000);
    
    if (!sock.authState.creds.registered) {
      let code = await sock.requestPairingCode(num);
      code = code?.match(/.{1,4}/g)?.join('-') || code;
      console.log('=== CODE:', code, 'FOR', num, '===');
      
      if (!res.headersSent) {
        res.send({ 
          code: code,
          number: num,
          note: 'Code inashikiliwa 90 sec - weka HARAKA ndani ya WhatsApp!' 
        });
      }
      
      // SHIKILIA SOCKET 90 SEC USIFUNGE!
      await delay(90000);
      try { sock.end(); } catch {}
    }
  } catch (e) {
    console.log('PAIR FAIL:', e.message);
    if (!res.headersSent) res.status(500).send({ error: e.message, try: 'Subiri 2 min ujaribu tena' });
  }
});

module.exports = router;
