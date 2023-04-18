const session = require('express-session');

modules.exports = {

    sessionMiddleware: session({
        secret: 'peanut_butter_is_bad',
        resave: false,
        saveUninitialized:false
    }),

};