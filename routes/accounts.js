var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var mysqlConnection = require('../utilities/mysqlConnection.js')
var config = require('../config/config.js');

//Authorize only signed in users
var userAuth = function(req, res, next){
    if(req.session && req.session.auth){
        return next();
    } else {
        res.sendStatus(401);
    }
};

//Authorize only guests (non-signed in) users
var guestAuth = function(req, res, next){
    if(req.session && req.session.auth){
        res.sendStatus(401);
    } else {
        return next();
    }
};

/* GET Account Login/Register View */
router.get('/', guestAuth, function(req, res, next) {
    res.render('registration/login', function(err, html) {
        res.send(router.generateResponseObject('<i class="fa fa-user"></i>  Sign In or Register', html));
    });
});

/* Account Login with username and password */
router.post('/login', guestAuth, function(req, res, next){
    var userName = req.body.inputUserName;
    var password = req.body.inputPassword;

    var pool = mysqlConnection();
    pool.getConnection(function(err, connection) {
        connection.query('SELECT password, uid, username FROM user WHERE username = ?', [userName],function(err, rows, fields){
            if(err){
                router.sendError(res, 'Database issues, unable to login!');
            } else {
                var responseObject = {};
                if(rows.length != 0) {
                    var hashedPW = rows[0].password;
                    bcrypt.compare(password, hashedPW, function (err, result) {
                        if (result == true) {
                            responseObject.status = 'Success';
                            req.session.auth = true;
                            req.session.uid = rows[0].uid;
                            req.session.username = rows[0].username;
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
router.get('/register', guestAuth, function(req, res, next){
    res.render('registration/register', {params: {username: req.query.username}}, function(err, html){
        res.send(router.generateResponseObject('<i class="fa fa-user-plus"></i> Register', html));
    });
});

/* Register an account */
router.post('/register', guestAuth, function(req, res, next){
    var userName = req.body.inputUserName;
    var email = req.body.inputEmail;
    var password = req.body.inputPassword;
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    //Throw a 404 to someone who bypassed clientside validation, temporarily, to do later
    if(userName === null || userName.length < 4 || userName.length > 25){
        router.sendError(res, "Username must be between 4 and 25 characters long.");
    } else if(email === null || email.length > 255 || email.length == 0 || !re.test(email)){
        router.sendError(res, "Email must be a valid email including the @ character.");
    } else if(password === null || password.length < 6 || password.length > 128){
        router.sendError(res, "Password must be between 6 and 128 characters long.");
    }
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if(err){
                console.log(err);
                router.sendError(res, "Unable to encrypt password!");
            } else {
                // Store Hash in password DB
                var pool = mysqlConnection();
                pool.getConnection(function (err, connection) {
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
                            var responseObject = {};
                            responseObject.state = "Success";
                            responseObject.title = "<i class='fa fa-thumbs-up'></i> Congratulations!";
                            res.render('registration/success', {params: {username: userName}}, function (err, html) {
                                responseObject.body = html;
                                res.send(responseObject);
                            });
                        }
                    });
                });
            }
        });
    });
});

router.sendError = function(res, message){
    var responseObject = {};
    responseObject.state = "Failed";
    responseObject.message = message;
    res.send(responseObject);
};

//Create JSON Object with the Modal Title and Body
router.generateResponseObject = function(title, content){
    var responseObject = {};
    responseObject.title = title;
    responseObject.body = content;

    return responseObject;
};

module.exports = router;