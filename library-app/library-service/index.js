const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const flash = require('connect-flash');

const app = express();
const port = 3000;
const apiBookRouter = require('./src/routes/api/book/book.router');
const viewBookRouter = require('./src/routes/view/book/book.router');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'yourSecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const users = [];

app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views'); // Обновленный путь к views

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Переопределение метода для поддержки PUT и DELETE в формах
app.use('/uploads', express.static('uploads'));

// Роуты API
app.use('/api/books', apiBookRouter);

app.use('/books', viewBookRouter); 

// Роут для отображения страницы логина
app.get('/', (req, res) => {
  res.redirect('/api/user/login');
});

app.get('/api/user/login', (req, res) => {
  res.render('login', { message: req.flash() });
});

// Роут для отображения профиля пользователя
app.get('/api/user/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('profile', { username: req.user.username });
  } else {
    res.redirect('/api/user/login');
  }
});

// Роут для обработки логина
app.post('/api/user/login', passport.authenticate('local', {
  successRedirect: '/books', // Перенаправление на страницу с библиотекой
  failureRedirect: '/api/user/login',
  failureFlash: true // Включение отображения сообщений об ошибках
}));

// Роут для обработки регистрации
app.post('/api/user/signup', (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // Проверка уникальности логина
  const existingUser = users.find(u => u.username === username);
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

  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashedPassword });
  req.flash('success', 'Registration successful. Please log in.');
  console.log("Registered Users: ", users); // Лог для проверки
  res.redirect('/api/user/login');
});

// Обработка ошибок
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    const user = users.find(u => u.username === username);
    console.log("Authenticating User: ", username); // Лог для проверки
    if (!user) {
      console.log("User not found"); // Лог для проверки
      return done(null, false, { message: 'Incorrect username.' });
    }
    bcrypt.compare(password, user.password, function(err, res) {
      if (res) {
        console.log("Password match"); // Лог для проверки
        return done(null, user);
      } else {
        console.log("Password mismatch"); // Лог для проверки
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  const user = users.find(u => u.username === username);
  done(null, user);
});