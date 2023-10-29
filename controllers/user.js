const User = require("../models/userModel");
const { body, validationResult } = require("express-validator");

exports.registerUser = (req, res) => {
    const errors = validationResult(req);

    const {username, email} = req.body;

    if (!errors.isEmpty()){
        console.log(errors);
        res.status(400).json({error: "Invalid input!"})
    } 
    else {
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
}

exports.validate = (method) => {
    switch(method){
        case "registerUser": {
            return [
                body('username').notEmpty().trim().escape(),
                body('email').isEmail().trim().escape().normalizeEmail(),
                body('password').isLength({ min: 8})                
            ]
        }
    }
}