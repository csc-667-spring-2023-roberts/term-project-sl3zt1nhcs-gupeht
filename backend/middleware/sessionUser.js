const session = require('express-session');

module.exports = {

    sessionMiddleware: session({
        secret: 'peanut_butter_is_bad',
        resave: false,
        saveUninitialized:true,
        cookies:{
            maxAge: 24 *60 *60 *1000, // 1 day
            httpOnly: true,
            secure: false, // set to true if we use HTTPS
            sameSite:'lax',
        },
    }),

};