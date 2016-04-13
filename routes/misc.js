/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var express = require('express');
var router = express.Router();
var responseObject = require('../utilities/responseObject');

router.get('/chat/password', function(req, res, next){
    res.render('chat/password', function(err, html){
        if(err){
            res.send('Please try again!');
        }
        res.send(html);
    });
});


module.exports = router;