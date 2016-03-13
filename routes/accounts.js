var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
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

router.post('/login', function(req, res, next){
    var userName = req.body.inputUserName;
    var password = req.body.inputPassword;

    var connection = mysqlConnection();
    connection.getConnection(function(err, connection) {
        connection.query('SELECT password FROM user WHERE username = ?', [userName],function(err, rows, fields){
            if(err){
                router.sendError(res, 'Database issues, unable to login!');
            } else {
                var responseObject = {};
                if(rows.length != 0) {
                    var hashedPW = rows[0].password;
                    bcrypt.compare(password, hashedPW, function (err, result) {
                        if (result == true) {
                            responseObject.status = 'Success';
                        } else {
                            responseObject.status = 'Wrong Password';
                        }
                        res.send(responseObject);
                    });
                } else {
                    responseObject.status = 'Invalid User';
                    res.send(responseObject);
                }
            }
        });
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
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if(err){
                console.log(err);
                router.sendError(res, 'Unable to encrypt password!');
            } else {
                // Store hash in your password DB.
                var connection = mysqlConnection();
                connection.getConnection(function (err, connection) {
                    connection.query('INSERT INTO user (username, password, email, usergroup_uid, ip_address) VALUES (?, ?, ?, ?, ?)', [userName, hash, email, config.defaults.usergroup, req.connection.remoteAddress], function (err, rows, fields) {
                        if (err) {
                            if (err.code === 'ER_DUP_ENTRY') {
                                var errorMessage = String(err.message);
                                if (errorMessage.indexOf(userName) > -1) {
                                    router.sendError(res, 'The username ' + userName + ' is already taken!');
                                } else if (errorMessage.indexOf(email) > -1) {
                                    router.sendError(res, 'The email address ' + email + ' is already taken!');
                                } else {
                                    router.sendError(res, 'A database issue occurred! ' + err.message);
                                }
                            }
                        } else {
                            res.render('registration/success', {params: {username: userName}}, function (err, html) {
                                res.send(router.generateResponseObject('<i class="fa fa-thumbs-up"></i> Congratulations!', html));
                            });
                        }
                    });
                });
            }
        });
    });
});


router.sendError = function(res, message){
    res.render('registration/error', {params: {message: message}}, function (err, html) {
        res.send(router.generateResponseObject('<i class="fa fa-exclamation-triangle"></i> Oops something went wrong!', html));
    });
};

//Create JSON Object with the Modal Title and Body
router.generateResponseObject = function(title, content){
    var responseObject = {};
    responseObject.title = title;
    responseObject.body = content;

    return responseObject;
};

module.exports = router;
