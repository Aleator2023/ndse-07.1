const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const path = require('path');

let books = [];

// Авторизация пользователя
router.post('/login', (req, res) => {
  res.status(201).json({ id: 1, mail: "test@mail.ru" });
});

// Получить все книги
router.get('/', (req, res) => {
  res.json(books);
});

// Получить книгу по ID
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Создать книгу с загрузкой файла
router.post('/', upload.single('fileBook'), (req, res) => {
  const newBook = {
    ...req.body,
    id: (books.length + 1).toString(),
    fileBook: req.file ? req.file.path : ''
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

// Редактировать книгу по ID
router.put('/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex !== -1) {
    books[bookIndex] = { ...books[bookIndex], ...req.body };
    res.json(books[bookIndex]);
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Удалить книгу по ID
router.delete('/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    res.send('ok');
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Скачивание файла книги по ID
router.get('/:id/download', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (book && book.fileBook) {
    res.download(path.resolve(book.fileBook));
  } else {
    res.status(404).send('Файл книги не найден');
  }
});

module.exports = router;
