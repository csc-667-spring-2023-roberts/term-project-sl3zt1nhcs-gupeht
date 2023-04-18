const session = require('express-session');

module.exports = {

    sessionMiddleware: session({
        secret: 'peanut_butter_is_bad',
        resave: false,
        saveUninitialized:false
    }),

};