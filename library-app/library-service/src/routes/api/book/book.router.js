const express = require('express');
const router = express.Router();
const Book = require('../../../models/Book');
const Comment = require('../../../models/Comment');

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).exec();
    const comments = await Comment.find({ bookId: book._id }).populate('userId').exec();
    console.log('Book:', book); // Логируем данные книги
    console.log('Comments:', comments); // Логируем комментарии
    res.render('view', { book, comments, user: req.user });
  } catch (err) {
    console.error(err); // Логируем ошибки
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;