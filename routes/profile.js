/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var express = require('express');
var router = express.Router();

//Authorize only signed in users
var userAuth = function(req, res, next){
    if(req.session && req.session.auth){
        return next();
    } else {
        res.sendStatus(401);
    }
};

router.get('/', function(req, res, next) {
    res.sendStatus(401);
});

router.get('/navbar', userAuth, function(req, res, next) {
    res.render('navbar/dropdown', function(err, html) {
        res.send(html);
    });
});

module.exports = router;