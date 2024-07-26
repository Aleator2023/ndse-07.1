// library-service/src/middleware/auth.js

const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey'; // Секретный ключ для подписи токенов

// Middleware для проверки сессии
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/api/user/login');
}

// Middleware для проверки JWT токена
function isAuthenticated(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).send('Access Denied: No Token Provided!');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
}

module.exports = {
  ensureAuthenticated,
  isAuthenticated
};