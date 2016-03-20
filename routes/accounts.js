var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var mysqlConnection = require('../utilities/mysqlConnection.js')
var config = require('../config/config.js');
var validator = require('validator');
var xssFilters = require('xss-filters');
var responseObject = require('../utilities/responseObject');

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
        res.send(responseObject.generateResponseObject('<i class="fa fa-user"></i>  Sign In or Register', html));
    });
});

/* Account Login with username and password */
router.post('/login', guestAuth, function(req, res, next){
    var userName = req.body.inputUserName;
    var password = req.body.inputPassword;

    var pool = mysqlConnection();
    pool.getConnection(function(err, connection) {
        connection.query('SELECT password, uid, username, avatar_path FROM user WHERE username = ?', [userName],function(err, rows, fields){
            if(err){
                responseObject.sendError(res, 'Database issues, unable to login!');
            } else {
                var customResponseObject = {};
                if(rows.length != 0) {
                    var hashedPW = rows[0].password;
                    bcrypt.compare(password, hashedPW, function (err, result) {
                        if (result == true) {
                            customResponseObject.status = 'Success';
                            customResponseObject.avatarPath = rows[0].avatar_path;
                            customResponseObject.username = xssFilters.inHTMLData(rows[0].username);
                            req.session.auth = true;
                            req.session.uid = rows[0].uid;
                            req.session.username = rows[0].username;

                        } else {
                            customResponseObject.status = 'Wrong Password';
                        }
                        res.send(customResponseObject);
                    });
                } else {
                    customResponseObject.status = 'Invalid User';
                    res.send(customResponseObject);
                }
            }
        });
    });
});

/* Display Account Registration Form */
router.get('/register', guestAuth, function(req, res, next){
    res.render('registration/register', {params: {username: xssFilters.inHTMLData(req.query.username)}}, function(err, html){
        res.send(responseObject.generateResponseObject('<i class="fa fa-user-plus"></i> Register', html));
    });
});

/* Register an account */
router.post('/register', guestAuth, function(req, res, next){
    var userName = req.body.inputUserName;
    var email = req.body.inputEmail;
    var password = req.body.inputPassword;

    //Throw a 404 to someone who bypassed clientside validation, temporarily, to do later
    if(userName === null || userName.length < 4 || userName.length > 25){
        res.send(responseObject.generateErrorObject("Username must be between 4 and 25 characters long."));
    } else if(email === null || email.length > 255 || email.length == 0 || !validator.isEmail(email)){
        res.send(responseObject.generateErrorObject("Email must be a valid email including the @ character."));
    } else if(password === null || password.length < 6 || password.length > 128){
        res.send(responseObject.generateErrorObject("Password must be between 6 and 128 characters long."));
    }
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if(err){
                console.log(err);
                res.send(responseObject.generateErrorObject("Unable to encrypt password!"));
            } else {
                // Store Hash in password DB
                var pool = mysqlConnection();
                pool.getConnection(function (err, connection) {
                    connection.query('INSERT INTO user (username, password, email, usergroup_uid, ip_address, avatar_path) VALUES (?, ?, ?, ?, ?, ?)', [userName, hash, email, config.defaults.usergroup, req.connection.remoteAddress, config.defaults.avatarPath], function (err, rows, fields) {
                        if (err) {
                            if (err.code === 'ER_DUP_ENTRY') {
                                var errorMessage = String(err.message);
                                if (errorMessage.indexOf(userName) > -1) {
                                    res.send(responseObject.generateErrorObject('The username ' + userName + ' is already taken!'));
                                } else if (errorMessage.indexOf(email) > -1) {
                                    res.send(responseObject.generateErrorObject('The email address ' + email + ' is already taken!'));
                                } else {
                                    res.send(responseObject.generateErrorObject('A database issue occurred! ' + err.message));
                                }
                            }
                        } else {
                            var customResponseObject = {};
                            customResponseObject.state = "Success";
                            customResponseObject.title = "<i class='fa fa-thumbs-up'></i> Congratulations!";
                            customResponseObject.avatarPath = config.defaults.avatarPath;
                            customResponseObject.username = xssFilters.inHTMLData(userName);
                            res.render('registration/success', {params: {username: xssFilters.inHTMLData(userName)}}, function (err, html) {
                                customResponseObject.body = html;
                                res.send(customResponseObject);
                            });
                        }
                    });
                });
            }
        });
    });
});

//TODO
router.get('/logout', userAuth, function(req, res, next){
    req.session.destroy(function(err){
        if(err){
            console.log('Logout error: ' + err);
            res.send("0");
        } else {
            res.send("1");
        }
    });
});

module.exports = router;