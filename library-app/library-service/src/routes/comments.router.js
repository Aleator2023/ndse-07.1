const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Middleware для проверки аутентификации
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/api/user/login');
}

// Добавление комментария
router.post('/:id/comment', isAuthenticated, async (req, res) => {
  const newComment = new Comment({
    bookId: req.params.id,
    userId: req.user._id,
    content: req.body.content
  });
  await newComment.save();
  res.redirect(`/books/${req.params.id}`);
});

module.exports = router;