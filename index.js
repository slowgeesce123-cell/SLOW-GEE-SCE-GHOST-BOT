const express = require('express');
const app = express();
const PairCode = require('./Pair.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/pair', PairCode);

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>GHOST BOT</title>
      <style>
        body{background:#0f0f0f;color:#fff;font-family:Arial;text-align:center;padding-top:50px}
        .box{background:#1a1a1a;padding:30px;border-radius:15px;display:inline-block;border:2px solid #a855f7}
        input{padding:12px;width:250px;border-radius:8px;border:none;margin:10px}
        button{padding:12px 30px;background:#a855f7;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer}
      </style></head>
      <body>
        <div class="box">
          <h1>👻 SLOW-GEE-SCE GHOST BOT</h1>
          <p>YOUR BOT YOUR SERVER - CYPHER X STYLE</p>
          <hr>
          <h3>Link WhatsApp</h3>
          <input id="num" placeholder="255... namba yako" />
          <br><button onclick="getCode()">GET PAIR CODE</button>
          <p id="result"></p>
        </div>
        <script>
          async function getCode(){
            let n=document.getElementById('num').value;
            if(!n){alert('Weka namba');return}
            document.getElementById('result').innerHTML='⏳ Inatengeneza...';
            let res=await fetch('/pair?number='+n);
            let data=await res.json();
            document.getElementById('result').innerHTML='<h2>'+ (data.code || JSON.stringify(data)) +'</h2><p>Nenda WhatsApp > Linked Devices > Link with phone number</p>';
          }
        </script>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('SLOW-GEE GHOST LIVE IN '+PORT));
