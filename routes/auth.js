const express = require('express');
const {body, validationResult} = require('express-validator');
const router = express.Router();

const User = require('../models/userModel');

router.get('/register', (req, res) => {
    res.render("register");
})

router.post('/register', [
    body('username').notEmpty().trim().escape(),
    body('email').isEmail().trim().escape().normalizeEmail(),
    body('password').isLength({ min: 8})
],(req, res) => {
    const errors = validationResult(req);
    const {username, email, password} = req.body;
    if(!errors.isEmpty()){
        console.log(errors);
        res.status(400).json({error: "Invalid input!"})
    } else {
        User.findOne({ $or: [{username}, {email}] }, (err, user) => {
            if(err){
                console.log(err);
                res.status(500).json({error: "Something went wrong.Please try again!"});
            } else if(user) {
                res.status(400).json({error: "Username or Email already exists"});
            } else {
                // Hash password, create user and save user to the database
                try {
                    const bcrypt = require('bcrypt');
                    const saltRounds = 12;
                    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                        if(err){
                            throw new Error(err);
                        }
                        else {
                            console.log(hash);
                            const newUser = new User({
                                username: req.body.username, email: req.body.email, password: hash
                            });

                            newUser.save().then(doc => {
                                console.log(doc);
                                res.status(200).json({message: "Registration successfull"});
                            }).catch(err => {
                                res.status(500).json({error: "Something went wrong.Please try again!"});
                            })
                        }
                    });
                }
                catch(e) {
                    console.log(e);
                    res.status(500).json({error: "Something went wrong.Please try again!"});
                }
            }
        })
    }
    // console.log(req.body);
    // res.send("Done");
})

router.get('/login', (req, res) => {
    res.render("login");
})

module.exports = router;