const express = require('express');
const app = express();
const port = 3000;

const booksRouter = require('../routes/books');

app.use(express.json());
app.use('/uploads', express.static('uploads')); 

app.use('/api/user', booksRouter);
app.use('/api/books', booksRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
