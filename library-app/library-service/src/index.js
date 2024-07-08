const express = require('express');
const methodOverride = require('method-override');
const app = express();
const port = 3000;

const apiBookRouter = require('./routes/api/book/book.router');
const apiUserRouter = require('./routes/api/user/user.router');
const viewBookRouter = require('./routes/view/book/book.router');
const { notFound, errorHandler } = require('./middleware/errorHandler');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Переопределение метода для поддержки PUT и DELETE в формах
app.use('/uploads', express.static('uploads'));

// Роуты API
app.use('/api/books', apiBookRouter);
app.use('/api/user', apiUserRouter);

app.get('/', (req, res) => {
  res.redirect('/books');
});

// Роуты для многостраничной части
app.use('/books', viewBookRouter);

// Обработка ошибок
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
