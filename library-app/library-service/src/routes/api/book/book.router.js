const express = require('express');
const router = express.Router();
const upload = require('../../../middleware/upload'); 
const path = require('path');
const axios = require('axios');

let books = [];

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

// Создать книгу
router.post('/', upload.single('fileBook'), (req, res) => {
  const newBook = {
    ...req.body,
    id: (books.length + 1).toString(),
    fileCover: req.file ? req.file.filename : '',
    fileBook: req.file ? req.file.filename : '',
    favorite: req.body.favorite === 'on'
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

// Редактировать книгу по ID
router.put('/:id', upload.single('fileBook'), (req, res) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex !== -1) {
    books[bookIndex] = {
      ...books[bookIndex],
      ...req.body,
      fileCover: req.file ? req.file.filename : books[bookIndex].fileCover,
      fileBook: req.file ? req.file.filename : books[bookIndex].fileBook,
      favorite: req.body.favorite === 'on'
    };
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

module.exports = router;
