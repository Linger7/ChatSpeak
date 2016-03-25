/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var express = require('express');
var router = express.Router();
var responseObject = require('../utilities/responseObject');
var xssFilters = require('xss-filters');
var multer = require('multer');
var user = require('../model/user');
var fs = require('fs');

//Get the profile modal
router.get('/', function(req, res, next) {
    user.getUserInfo(req.session.uid, function(err, data){
        if(err){
            console.log(err)
            res.sendStatus(401);
        } else {
            var usernameFiltered = xssFilters.inHTMLData(data.username);
            res.render('profile/profile', {
               params: {
                   username: usernameFiltered,
                   email: xssFilters.inHTMLData(data.email),
                   avatar: data.avatarPath,
                   usergroup: data.usergroup
               }
            }, function(err, html){
                res.send(responseObject.generateResponseObject('<i class="fa fa-pencil-square-o"></i> ' + usernameFiltered + '&#39;s Profile', html));
            });
        }
    });
});

//Get the change Avatar Modal
router.get('/avatar', function(req, res, next){
    user.getUserInfo(req.session.uid, function(err, data){
        if(err){
            console.log(err)
            res.sendStatus(401);
        } else {
            res.render('profile/avatar', {
                params: {
                    avatar : data.avatarPath
                }
            }, function(err, html){
                res.send(responseObject.generateResponseObject('<i class="fa fa-picture-o"></i> Edit your Avatar', html));
            });
        }
    });
});

//Update User Avatar
router.post('/avatar', multer({ dest: './uploads/avatars'}).single('inputAvatarFile'), function(req, res, next){
    var uploadedFile = req.file;
    if(uploadedFile){
        var responseObject = {};
        console.log(uploadedFile);
        if(uploadedFile.mimetype.indexOf('image') >= 0){
            fs.rename('./uploads/avatars/' + uploadedFile.filename, './public/images/avatars/' + uploadedFile.filename + '.png', function(err){
                if(err) throw err;
                var newPath = 'images/avatars/' + uploadedFile.filename + '.png';
                user.updateUserAvatar(req.session.uid, newPath, function(err, data){
                    if(err){
                        res.sendStatus(401);
                    } else {
                        responseObject.status = "Success";
                        responseObject.avatarPath = newPath;
                        req.session.avatarPath = newPath;
                        res.send(responseObject);
                    }
                });
            });
        } else {
            //If not an image, delete the file and return error
            fs.unlink('./uploads/avatars/' + uploadedFile.filename, function(err){
                if(err) throw err;
                responseObject.status = "Failed";
                responseObject.message = "Uploaded file is not an image!";
                res.send(responseObject);
            });
        }
    }
});

//Get the navbar profile dropdown menu
router.get('/navbar', function(req, res, next) {
    res.render('navbar/dropdown', function(err, html) {
        res.send(html);
    });
});

module.exports = router;