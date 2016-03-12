var express = require('express');
var router = express.Router();
var mysqlConnection = require('../utilities/mysqlConnection.js')
var config = require('../config/config.js');

/* GET Account Login/Register */
router.get('/', function(req, res, next) {
    //Check if signed in here

    //If not signed in then send register/login view
    res.render('registration/login', function(err, html) {
        res.send(router.generateResponseObject('<i class="fa fa-user"></i>  Sign In or Register', html));
    });
});

/* Display Account Registration Form */
router.get('/register', function(req, res, next){
    //Check if signed in here (add middleware)

    //If not signed in then proceed to register
    res.render('registration/register', function(err, html){
        res.send(router.generateResponseObject('<i class="fa fa-user-plus"></i> Register', html));
    });
});

/* Register an account */
router.post('/register', function(req, res, next){
    var userName = req.body.inputUserName;
    var email = req.body.inputEmail;
    var password = req.body.inputPassword;
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    //Throw a 404 to someone who bypassed clientside validation, temporarily, to do later
    if(userName === null || userName.length < 4 || userName.length > 25){
        res.send(404);
    } else if(email === null || email.length > 255 || email.length == 0 || !re.test(email)){
        res.send(404);
    } else if(password === null || password.length < 6 || password.length > 12){
        res.send(404);
    }

    var connection = mysqlConnection();
    connection.getConnection(function(err, connection){
        connection.query('INSERT INTO user (username, password, email, usergroup_uid, ip_address) VALUES (?, ?, ?, ?, ?)', [userName, password, email, config.defaults.usergroup, req.connection.remoteAddress],function(err, rows, fields){
            if(err){
                if(err.code === 'ER_DUP_ENTRY'){
                    var errorMessage = String(err.message);
                    if(errorMessage.indexOf(userName) > -1){
                        res.render('registration/error', {params: {message: 'The username ' + userName + ' is already taken!'}}, function(err, html) {
                            res.send(router.generateResponseObject('<i class="fa fa-exclamation-triangle"></i> Oops something went wrong!', html));
                        });
                    } else if(errorMessage.indexOf(email) > -1){
                        res.render('registration/error', {params: {message: 'The email address ' + email + ' is already taken!'}}, function(err, html) {
                            res.send(router.generateResponseObject('<i class="fa fa-exclamation-triangle"></i> Oops something went wrong!', html));
                        });
                    } else {
                        res.render('registration/error', {params: {message: err.message}}, function(err, html) {
                            res.send(router.generateResponseObject('<i class="fa fa-exclamation-triangle"></i> Oops something went wrong!', html));
                        });
                    }
                }
            } else {
                res.render('registration/success', {params: {username: userName}}, function(err, html) {
                    res.send(router.generateResponseObject('<i class="fa fa-thumbs-up"></i> Congratulations!', html));
                });
            }
        });
    });
});

//Create JSON Object with the Modal Title and Body
router.generateResponseObject = function(title, content){
    var responseObject = {};
    responseObject.title = title;
    responseObject.body = content;

    return responseObject;
};

module.exports = router;
