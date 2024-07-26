const express = require('express');
const router = express.Router();
const path = require('path');
const axios = require('axios');
const Book = require('../../../models/Book');
const Comment = require('../../../models/Comment'); 
const multer = require('multer');

// Настройка хранения файлов с использованием multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // уникальное имя файла
  }
});

const upload = multer({ storage: storage });

// Middleware для проверки аутентификации
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/api/user/login');
}

// Просмотр списка всех книг
router.get('/', isAuthenticated, async (req, res) => {
  const books = await Book.find().exec();
  res.render('index', { books });
});

// Страница создания книги
router.get('/create', isAuthenticated, (req, res) => {
  res.render('create');
});

// Создание книги с загрузкой файла
router.post('/', isAuthenticated, upload.single('fileBook'), async (req, res) => {
  const newBook = new Book({
    ...req.body,
    fileCover: req.file ? req.file.filename : '',
    fileBook: req.file ? req.file.filename : '',
    favorite: req.body.favorite === 'on'
  });
  await newBook.save();
  res.redirect('/books');
});

// Просмотр конкретной книги
router.get('/:id', isAuthenticated, async (req, res) => {
  const book = await Book.findById(req.params.id).exec();
  if (book) {
    try {
      // Увеличение счетчика просмотров
      await axios.post(`http://counter-service:4000/counter/${book.id}/incr`);
      // Получение текущего значения счетчика
      const response = await axios.get(`http://counter-service:4000/counter/${book.id}`);
      const viewCount = response.data.count;

      // Загрузка комментариев
      const comments = await Comment.find({ bookId: book._id }).populate('userId').exec();

      res.render('view', { book, viewCount, comments, user: req.user });
    } catch (error) {
      console.error('Error fetching counter service:', error);
      res.status(500).send('Ошибка сервиса счетчика');
    }
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Страница редактирования книги
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  const book = await Book.findById(req.params.id).exec();
  if (book) {
    res.render('update', { book });
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Редактирование книги по ID
router.put('/:id', isAuthenticated, upload.single('fileBook'), async (req, res) => {
  const book = await Book.findById(req.params.id).exec();
  if (book) {
    book.title = req.body.title || book.title;
    book.description = req.body.description || book.description;
    book.authors = req.body.authors || book.authors;
    book.fileCover = req.file ? req.file.filename : book.fileCover;
    book.fileBook = req.file ? req.file.filename : book.fileBook;
    book.favorite = req.body.favorite === 'on';
    await book.save();
    res.redirect(`/books/${req.params.id}`);
  } else {
    res.status(404).send('Книга не найдена');
  }
});

// Удаление книги по ID
router.delete('/:id', isAuthenticated, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id).exec();
  res.redirect('/books');
});

// Скачивание файла книги по ID
router.get('/:id/download', isAuthenticated, async (req, res) => {
  const book = await Book.findById(req.params.id).exec();
  if (book && book.fileBook) {
    res.download(path.resolve('uploads', book.fileBook));
  } else {
    res.status(404).send('Файл книги не найден');
  }
});

module.exports = router;