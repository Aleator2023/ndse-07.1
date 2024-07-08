const express = require('express');
const router = express.Router();
const upload = require('../../../middleware/upload');
const path = require('path');
const axios = require('axios');

let books = [];

// Просмотр списка всех книг
router.get('/', (req, res) => {
  res.render('index', { books });
});

// Страница создания книги
router.get('/create', (req, res) => {
  res.render('create');
});

// Создание книги с загрузкой файла
router.post('/', upload.single('fileBook'), (req, res) => {
  const newBook = {
    ...req.body,
    id: (books.length + 1).toString(),
    fileCover: req.file ? req.file.filename : '',
    fileBook: req.file ? req.file.filename : '',
    favorite: req.body.favorite === 'on'
  };
  books.push(newBook);
  res.redirect('/books');
});

// Просмотр конкретной книги
router.get('/:id', async (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (book) {
    // Увеличение счетчика просмотров
    await axios.post(`http://counter-service:4000/counter/${book.id}/incr`);
    // Получение текущего значения счетчика
    const response = await axios.get(`http://counter-service:4000/counter/${book.id}`);
    const viewCount = response.data.count;
    res.render('view', { book, viewCount });
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Страница редактирования книги
router.get('/:id/edit', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (book) {
    res.render('update', { book });
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Редактирование книги по ID
router.post('/:id', upload.single('fileBook'), (req, res) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex !== -1) {
    books[bookIndex] = {
      ...books[bookIndex],
      ...req.body,
      fileCover: req.file ? req.file.filename : books[bookIndex].fileCover,
      fileBook: req.file ? req.file.filename : books[bookIndex].fileBook,
      favorite: req.body.favorite === 'on'
    };
    res.redirect(`/books/${req.params.id}`);
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Удаление книги по ID
router.post('/:id?_method=DELETE', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    res.redirect('/books');
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Скачивание файла книги по ID
router.get('/:id/download', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (book && book.fileBook) {
    res.download(path.resolve('uploads', book.fileBook));
  } else {
    res.status(404).send('Файл книги не найден');
  }
});

module.exports = router;
