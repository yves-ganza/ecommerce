const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
    if(req.user){
        res.render('home', { username: req.user.username });
    }
    res.render('index');
})

module.exports = router;