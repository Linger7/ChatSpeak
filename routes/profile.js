/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var express = require('express');
var router = express.Router();
var mysqlConnection = require('../utilities/mysqlConnection.js')
var responseObject = require('../utilities/responseObject');
var xssFilters = require('xss-filters');
var multer = require('multer');
var fs = require('fs');
var pool = mysqlConnection();

//Get the profile modal
router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection){
        connection.query('SELECT username, email, avatar_path, usergroup_uid, date_created FROM USER WHERE uid = ?', [req.session.uid], function (err, rows, fields) {
            if(err){
                console.log(err);
                res.sendStatus(401);
            } else {
                if(rows.length != 0) {
                    var username = xssFilters.inHTMLData(rows[0].username);
                    res.render('profile/profile', {
                        params: {
                            username: username,
                            email: xssFilters.inHTMLData(rows[0].email),
                            avatar: rows[0].avatar_path,
                            usergroup: rows[0].usergroup_uid
                        }
                    }, function(err, html){
                        res.send(responseObject.generateResponseObject('<i class="fa fa-pencil-square-o"></i> ' + username + '&#39;s Profile', html));
                    });
                } else {
                    console.log("No profile in session?");
                    res.sendStatus(401);
                }
            }
        });
    });
});

//Get the change Avatar Modal
router.get('/avatar', function(req, res, next){
    pool.getConnection(function(err, connection){
        connection.query("SELECT avatar_path FROM USER WHERE uid = ?", [req.session.uid], function(err, rows,  fields){
            if(err){
                console.log(err);
                res.sendStatus(401);
            } else {
                if(rows.length != 0) {
                    res.render('profile/avatar', {
                        params: {
                            avatar : rows[0].avatar_path
                        }
                    }, function(err, html){
                        res.send(responseObject.generateResponseObject('<i class="fa fa-picture-o"></i> Edit your Avatar', html));
                    });
                } else {
                    console.log("No profile in session?");
                    res.sendStatus(401);
                }
            }
        });
    });
});

router.post('/avatar', multer({ dest: './uploads/avatars'}).single('inputAvatarFile'), function(req, res, next){
    var uploadedFile = req.file;
    if(uploadedFile){
        var responseObject = {};
        console.log(uploadedFile);
        if(uploadedFile.mimetype.indexOf('image') >= 0){
            fs.rename('./uploads/avatars/' + uploadedFile.filename, './public/images/avatars/' + uploadedFile.filename + '.png', function(err){
                if(err) throw err;
                pool.getConnection(function(err, connection){
                    connection.query("UPDATE user SET avatar_path = ? WHERE uid = ?", ['images/avatars/' + uploadedFile.filename + '.png', req.session.uid], function(err, rows, fields){
                        if(err) throw err;
                        responseObject.status = "Success";
                        res.send(responseObject);
                    });
                });
            })
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