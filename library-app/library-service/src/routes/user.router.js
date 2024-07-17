const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../../src/models/User'); 

// Страница входа
router.get('/login', (req, res) => {
  res.render('login', { message: req.flash() });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/books', // Перенаправление на страницу с библиотекой
  failureRedirect: '/api/user/login',
  failureFlash: true // Включение отображения сообщений об ошибках
}));

router.post('/signup', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // Проверка уникальности логина
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    req.flash('error', 'Username already exists.');
    return res.redirect('/api/user/login');
  }

  // Проверка подтверждения пароля
  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match.');
    return res.redirect('/api/user/login');
  }

  // Проверка сложности пароля
  if (password.length < 6) {
    req.flash('error', 'Password must be at least 6 characters long.');
    return res.redirect('/api/user/login');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  req.flash('success', 'Registration successful. Please log in.');
  console.log("Registered Users: ", await User.find()); // Лог для проверки
  res.redirect('/api/user/login');
});

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('profile', { username: req.user.username });
  } else {
    res.redirect('/api/user/login');
  }
});

// Маршрут выхода
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    req.logout(); 
    res.redirect('/api/user/login');
  });
});

module.exports = router;