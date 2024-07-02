const express = require('express');
const methodOverride = require('method-override');
const app = express();
const port = 3000;

const booksRouter = require('../routes/books');
const { notFound, errorHandler } = require('../middleware/errorHandler');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); 
app.use('/uploads', express.static('uploads'));

app.use('/books', booksRouter); 

// Обработка ошибок
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
