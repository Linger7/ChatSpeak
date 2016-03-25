var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var config = require('../config/config.js');
var validator = require('validator');
var xssFilters = require('xss-filters');
var responseObject = require('../utilities/responseObject');
var user = require('../model/user');

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
router.post('/login', guestAuth, function (req, res, next) {
    var userName = req.body.inputUserName;
    var password = req.body.inputPassword;

    user.getLoginInformation(userName, function (err, data) {
        var customResponseObject = {};
        if (err) {
            customResponseObject.status = err;
            res.send(customResponseObject);
        } else {
            var hashedPW = data.password;
            bcrypt.compare(password, hashedPW, function (err, result) {
                if (err) {
                    customResponseObject.status = "Unable to validate password, please check again later!";
                } else {
                    if (result) {
                        customResponseObject.status = 'Success';
                        customResponseObject.avatarPath = data.avatarPath;
                        customResponseObject.username = xssFilters.inHTMLData(data.username);
                        req.session.auth = true;
                        req.session.uid = data.uid;
                        req.session.username = data.username;
                        req.session.avatarPath = data.avatarPath;
                    } else {
                        customResponseObject.status = 'Wrong Password';
                    }
                }
                res.send(customResponseObject);
            });
        }
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
                user.createUser(userName, hash, email, req.connection.remoteAddress, function(err, data){
                    if(err){
                        res.send(responseObject.generateErrorObject(err));
                    } else {
                        res.render('registration/success', {params: {username: xssFilters.inHTMLData(data.username)}}, function (err, html) {
                            data.body = html;
                            res.send(data);
                        });
                    }
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