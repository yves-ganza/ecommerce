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

module.exports = router;

