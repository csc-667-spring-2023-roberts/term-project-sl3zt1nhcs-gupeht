const session = require('express-session');const session = require('express-session');
const cookieParser = require('cookie-parser');

const ONE_HOUR = 1000 * 60 * 60;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const sessionMiddleware = session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: ONE_HOUR,
    sameSite: isProd ? 'none' : 'strict',
    secure: isProd
  }
});

const cookieMiddleware = cookieParser();

module.exports = { sessionMiddleware, cookieMiddleware };
