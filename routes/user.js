const express = require('express');
const router = express.Router();

const userController = require("../controllers/user")

router.get('/register', (req, res) => {
    res.render('register');
})

router.post(
    '/register',
    userController.validate('registerUser'),
    userController.registerUser,
)

router.get('/profile', (req, res) => {
    if(!req.user){
        res.redirect('/auth/login');
    }else {
        res.render('profile', {username: req.user.username, email: req.user.email});
    }
})

module.exports = router;

