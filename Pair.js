const express = require('express');
const fs = require('fs');
const { exec } = require("child_process");
let router = express.Router()
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true })
};

router.get('/', async (req, res) => {
    let num = req.query.number;
    async function RobinPair() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session_${num}`);
        try {
            let Robin = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!Robin.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Robin.requestPairingCode(num)
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Robin.ev.on('creds', saveCreds)
            Robin.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection == "open") {
                    await delay(5000);
                    let data = fs.readFileSync(`./session_${num}/creds.json`);
                    let rf = __dirname + `/creds.json`;
                    fs.writeFileSync(rf, data);
                    await delay(800);
                    let session = fs.readFileSync(rf);
                    let b64 = Buffer.from(session).toString('base64');
                    let sessionCode = "SLOWGEE~" + b64;
                    
                    // Send to user WhatsApp
                    let userJid = num + "@s.whatsapp.net";
                    await Robin.sendMessage(userJid, { text: sessionCode });
                    await Robin.sendMessage(userJid, { text: `*👻 SLOW-GEE-SCE GHOST SESSION CREATED! 👻*\n\nCopy hii code uweke kwenye Bot Kuu yako.\n\nPowered by SLOW-GEE` });

                    await delay(100);
                    await Robin.ws.close();
                    return await removeFile(`./session_${num}`);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    RobinPair();
                }
            });
        } catch (err) {
            console.log("Error", err);
            await removeFile(`./session_${num}`);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
    
    // DESIGN KALI - GHOST THEME
    if (!num) {
        return res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SLOW-GEE GHOST SESSION</title>
<style>
body{background:#000;color:#fff;font-family:Arial;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}
.card{background:#111;border:1px solid #333;border-radius:20px;padding:30px;width:90%;max-width:400px;text-align:center;box-shadow:0 0 30px #00ff8855}
h1{color:#00ff88;text-shadow:0 0 10px #00ff88;margin:0;font-size:28px}
p{color:#aaa}
input{width:90%;padding:15px;border-radius:10px;border:1px solid #333;background:#000;color:#fff;margin:15px 0;font-size:16px;text-align:center}
button{width:95%;padding:15px;border-radius:10px;border:none;background:#00ff88;color:#000;font-weight:bold;font-size:16px;cursor:pointer;box-shadow:0 0 15px #00ff88}
button:hover{background:#fff}
.footer{margin-top:20px;font-size:12px;color:#555}
.ghost{font-size:50px;animation:float 2s infinite}
@keyframes float{0%{transform:translateY(0)}50%{transform:translateY(-10px)}100%{transform:translateY(0)}}
</style>
</head>
<body>
<div class="card">
<div class="ghost">👻</div>
<h1>SLOW-GEE</h1>
<h3 style="margin:5px;color:#fff">GHOST SESSION</h3>
<p>Enter your WhatsApp number with country code</p>
<input type="text" id="num" placeholder="2547XXXXXXXX">
<button onclick="go()">GENERATE PAIR CODE</button>
<p id="code" style="margin-top:20px;color:#00ff88;font-weight:bold;font-size:20px"></p>
<div class="footer">Powered by SLOW-GEE-SCE 👻<br>24/7 Ghost Service</div>
</div>
<script>
function go(){
let n=document.getElementById('num').value;
if(!n){alert('Weka namba boss!');return}
document.getElementById('code').innerText='Generating...';
fetch('/?number='+n).then(r=>r.json()).then(d=>{
document.getElementById('code').innerText=d.code||d.code;
})
}
</script>
</body>
</html>
        `);
    }
    return await RobinPair()
});

module.exports = router
