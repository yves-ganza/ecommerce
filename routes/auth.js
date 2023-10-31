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
        cb(null, { username: user.username, email: user.email });
    });
});

passport.deserializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, user);
    });
});


router.get('/login', (req, res) => {
    if(req.user) return res.redirect('/');

    else if(req.session.messages){
        res.render("login", { message: req.session.messages[0]});
    }
    else {
        res.render("login");
    }
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureMessage: true
}))

router.post('/logout', (req, res) => {
    if(!req.user){
        res.redirect('back');
    }
    else{
        req.logout(err => {
            if(err){
                res.status(400).redirect('back');
            }
            else res.redirect('/');
        })
    }
})

module.exports = router;