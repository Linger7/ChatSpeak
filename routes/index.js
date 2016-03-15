var express = require('express');
var router = express.Router();
var mysqlConnection = require('../utilities/mysqlConnection.js')
var config = require('../config/config.js');

/* GET Home Page. */
router.get('/', function(req, res, next) {

    if(req.session && req.session.auth){
        res.render('index', { logo: config.defaults.logo, title: 'ChatSpeak', isAuthed: true, username: req.session.username });
    } else {
        res.render('index', { logo: config.defaults.logo, title: 'ChatSpeak', isAuthed: false });
    }
});

module.exports = router;
