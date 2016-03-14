var express = require('express');
var router = express.Router();
var mysqlConnection = require('../utilities/mysqlConnection.js')

/* GET Home Page. */
router.get('/', function(req, res, next) {

    if(req.session && req.session.auth){
        res.render('index', { title: 'ChatSpeak', isAuthed: true, username: req.session.username });
    } else {
        res.render('index', { title: 'ChatSpeak', isAuthed: false });
    }
});

module.exports = router;
