const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

const router = express.Router();

const User = require('../models/userModel');

passport.use(new LocalStrategy( function verify(username, password, cb){
    User.findOne({ $or: [{username: username}, {email: username}] }, (err, user) => {

        if (err) { return cb(err); }
        if(!user) { return cb(null, false, { message: 'Incorrect username or password.'}); }

        bcrypt.compare(password, user.password, (err, result) => {
            console.log(result);
            if (err) { 
                return cb(err); 
            }
            else if (result == true) { 
                return cb(null, user); 
            }
            else {
                return cb(null, false, { message: 'Incorrect username or password.'});
            }
        });
    });
}));

passport.serializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, user);
    });
});


router.get('/login', (req, res) => {
    if(req.user) return res.redirect('/');
    res.render("login");
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
}))

module.exports = router;