var express = require('express');
var router = express.Router();

/* GET Account Login/Register */
router.get('/', function(req, res, next) {
    //Check if signed in here

    //If not signed in then send register/login view
    var responseObject = {};
    responseObject.title = 'Sign In or Register';

    res.render('login', function(err, html) {
        responseObject.body = html;
        res.send(responseObject);
    });
});

module.exports = router;
