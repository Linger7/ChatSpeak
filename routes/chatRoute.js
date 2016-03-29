/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var config = require('../config/config.js');
var responseObject = require('../utilities/responseObject');
var xssFilters = require('xss-filters');
var chatRoom = require('../model/chat_room');

router.get('/create/room', function(req, res, next){
    res.render('chat/createroom', function(err, html){
        res.send(responseObject.generateResponseObject('<i class="fa fa-weixin"></i> Create Chat Room', html));
    });
});

router.post('/create/room', function(req, res, next){
    var chatName = req.body.inputChatRoomName;
    var chatPassword = req.body.inputChatPassword;
    var chatDescription = req.body.inputDescription;

    //Validation
    if(chatName === null || chatName === ""){
        res.send(responseObject.generateErrorObject("You must enter a name for your chat room!"));
    } else if(chatDescription.length > 5000){
        res.send(responseObject.generateErrorObject("Your room description must be under 5000 characters, currently: " + chatDescription.length));
    } else if(chatName.length > 100){
        res.send(responseObject.generateErrorObject("Your chat room name must be under 100 characters, currently: " + chatName.length));
    }

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(chatPassword, salt, function(err, hash) {
            if(err){
                console.log(err);
                res.send(responseObject.generateErrorObject("Unable to encrypt password!"));
            } else {
                chatRoom.createChatRoom(chatName, hash, chatDescription, req.session.uid, function(err){
                    if(err){
                        res.send(responseObject.generateErrorObject(err));
                    } else {
                        res.render('chat/createsuccess', {params: {chatName: xssFilters.inHTMLData(chatName)}}, function (err, html) {
                            var data = {};
                            data.title = '<i class="fa fa-check-square green"></i> Chat Room Created!';
                            data.body = html;
                            res.send(data);
                        });
                    }
                });
            }
        });
    });
});

module.exports = router;