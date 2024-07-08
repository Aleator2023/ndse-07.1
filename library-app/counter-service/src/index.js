const express = require('express');
const fs = require('fs-extra');
const app = express();
const PORT = 4000;

const COUNTERS_FILE = 'src/counters.json';

app.use(express.json());

app.post('/counter/:bookId/incr', async (req, res) => {
  const bookId = req.params.bookId;
  let counters = await fs.readJson(COUNTERS_FILE).catch(() => ({}));

  if (!counters[bookId]) {
    counters[bookId] = 0;
  }
  counters[bookId] += 1;

  await fs.writeJson(COUNTERS_FILE, counters);
  res.sendStatus(200);
});

app.get('/counter/:bookId', async (req, res) => {
  const bookId = req.params.bookId;
  let counters = await fs.readJson(COUNTERS_FILE).catch(() => ({}));

  const count = counters[bookId] || 0;
  res.json({ count });
});


app.get('/', (req, res) => {
  res.send('Counter service is running');
});

app.listen(PORT, () => {
  console.log(`Counter service running on port ${PORT}`);
});
