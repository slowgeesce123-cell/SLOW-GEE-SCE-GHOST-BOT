const express = require('express');
const app = express();
const PairRouter = require('./Pair.js');

app.use(express.json());

// HII NDIO MUHIMU - inaunganisha Pair.js na /pair
app.use('/pair', PairRouter);

app.get('/', (req, res) => {
  res.send(`
    <h1>👻 SLOW-GEE GHOST BOT IS ALIVE</h1>
    <p>Service Live at: ${req.get('host')}</p>
    <p>Use: <a href="/pair?number=2556xxxxxxx">/pair?number=2556xxxxxxx</a></p>
    <br>
    <h2>How to get Pair Code:</h2>
    <p>Add ?number=YOUR_NUMBER to /pair</p>
    <p>Example: /pair?number=255715000000</p>
  `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`SLOW-GEE GHOST LIVE IN ${PORT}`);
});
