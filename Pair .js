const {default:makeWASocket,useMultiFileAuthState,makeCacheableSignalKeyStore}=require('@whiskeysockets/baileys')
const express=require('express')
const P=require('pino')
const fs=require('fs')
const app=express()
const PORT=process.env.PORT||10000
const bots=new Map()
app.use(express.urlencoded({extended:true}))

app.get('/',(req,res)=>{
res.send(`<h1>👻 SLOW-GEE PAIR 👻</h1><h2>OWNER: SLOW GEE SCE</h2><form action="/pair"><input name="number" placeholder="2547XXX" required><button>PATA CODE</button></form><p>Bots:${bots.size}</p>`)
})

app.get('/pair',async(req,res)=>{
let n=req.query.number.replace(/[^0-9]/g,'')
let d='./sessions/'+n
if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true})
let {state,saveCreds}=await useMultiFileAuthState(d)
let s=makeWASocket({logger:P({level:'silent'}),auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,P({level:'silent'}))},browser:['SLOW-GEE','Chrome','1.0']})
s.ev.on('creds.update',saveCreds)
if(!s.authState.creds.registered){
await new Promise(r=>setTimeout(r,3000))
let c=await s.requestPairingCode(n)
res.send(`<h1>CODE:<b>${c}</b></h1><p>${n}</p><a href="/">Rudi</a>`)
setTimeout(()=>start(n),5000)
}else{
res.send(`${n} active!`)
start(n)
}
})

async function start(num){
if(bots.has(num))return
let d='./sessions/'+num
if(!fs.existsSync(d))return
let {state,saveCreds}=await useMultiFileAuthState(d)
let sock=makeWASocket({logger:P({level:'silent'}),auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,P({level:'silent'}))},browser:['SLOW-GEE','Chrome','1.0']})
sock.ev.on('creds.update',saveCreds)
bots.set(num,sock)
sock.ev.on('connection.update',u=>{
if(u.connection==='open')console.log(`BOT ${num} LIVE`)
if(u.connection==='close'){bots.delete(num);setTimeout(()=>start(num),5000)}
})
sock.ev.on('messages.upsert',async({messages})=>{
let m=messages[0]
if(!m.message||m.key.fromMe)return
let b=m.message.conversation||m.message.extendedTextMessage?.text||''
if(!b.startsWith('.'))return
let cmd=b.slice(1).split(' ')[0].toLowerCase()
let from=m.key.remoteJid
if(cmd==='menu')await sock.sendMessage(from,{text:`*SLOW-GEE GHOST*\nBot:${num}\nOwner:SLOW GEE\n.alive .owner .ping .tagall`},{quoted:m})
if(cmd==='alive')await sock.sendMessage(from,{text:`ALIVE Bot ${num}`},{quoted:m})
if(cmd==='owner')await sock.sendMessage(from,{text:'OWNER: SLOW GEE SCE'}, {quoted:m})
if(cmd==='ping')await sock.sendMessage(from,{text:'Pong!'}, {quoted:m})
})
}

app.listen(PORT,()=>{
console.log('LIVE '+PORT)
if(fs.existsSync('./sessions'))fs.readdirSync('./sessions').forEach(n=>start(n))
})
