const express = require('express');
const app = express();

app.use(express.json());

// Pair route
app.use('/pair', require('./Pair'));

app.get('/', (req, res) => {
  res.send(`
    <h1>SLOW-GEE-SESSION LIVE ✅</h1>
    <p>Pair: <code>/pair?number=254791536079</code></p>
    <p>Example: https://slow-gee-session.onrender.com/pair?number=254791536079</p>
  `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('SLOW GEE LIVE on ' + PORT));
