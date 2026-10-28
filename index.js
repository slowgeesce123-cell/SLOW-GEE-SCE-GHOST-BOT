const express = require('express');
const PairRouter = require('./Pair.js');
const app = express();
app.use('/pair', PairRouter);
app.get('/', (req,res)=>{
res.send('SLOW-GEE GHOST BOT IS ALIVE - Nenda /pair?number=255XXXXXXXX');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Server on '+PORT));
