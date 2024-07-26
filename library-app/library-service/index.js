// library-service/index.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./src/models/User');
const Comment = require('./src/models/Comment'); // Добавление модели комментариев
const { ensureAuthenticated, isAuthenticated } = require('./src/middleware/auth');
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017/library';

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const apiBookRouter = require('./src/routes/api/book/book.router');
const viewBookRouter = require('./src/routes/view/book/book.router');
const commentRouter = require('./src/routes/comments.router');
const userRouter = require('./src/routes/user.router');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'yourSecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/uploads', express.static('uploads'));

app.use('/api/books', apiBookRouter);
app.use('/books', ensureAuthenticated, viewBookRouter);
app.use('/books', ensureAuthenticated, commentRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
  res.redirect('/api/user/login');
});

app.get('/api/user/login', (req, res) => {
  res.render('login', { message: req.flash() });
});

app.use(notFound);
app.use(errorHandler);

passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username }).exec();
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(async function(username, done) {
  try {
    const user = await User.findOne({ username }).exec();
    done(null, user);
  } catch (error) {
    done(error);
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('newComment', async (data) => {
    console.log('Новый комментарий получен:', data);

    try {
      // Сохранение комментария в базе данных
      const newComment = new Comment({
        bookId: data.bookId,
        userId: data.userId,
        content: data.content
      });
      await newComment.save();

      // Получение пользователя для отображения имени
      const populatedComment = await newComment.populate('userId', 'username').execPopulate();

      console.log('Комментарий успешно сохранен:', populatedComment);

      // Отправка комментария всем подключенным клиентам
      io.emit('newComment', populatedComment);
    } catch (error) {
      console.error('Ошибка при сохранении комментария:', error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});