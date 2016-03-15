/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.sendStatus(401);
});

router.get('/navbar', function(req, res, next) {
    res.render('navbar/dropdown', function(err, html) {
        res.send(html);
    });
});

module.exports = router;