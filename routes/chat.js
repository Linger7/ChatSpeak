/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var config = require('../config/config.js');
var xssFilters = require('xss-filters');
var chatMessage = require('../model/chat_message');
var chatRoom = require('../model/chat_room');
var BBCodeParser = require('bbcode-parser');
var parser = new BBCodeParser(BBCodeParser.defaultTags());

module.exports = function (io) {

    io.on('connection', function (socket) {
        console.log('A User Connected');
        console.log(socket.handshake.session);

        //Join the default lobby chat room
        joinChatRoom(config.defaults.defaultChatRoom, socket);

        //Get all the chat rooms
        getChatRooms(function(err, data){
            if(err){
                socket.emit('socket_chatError', {error : err});
            } else {
                //Send all the chat rooms
                socket.emit('socket_chatLoadAllChatRooms', data);
            }
        });

        socket.on('disconnect', function () {
            console.log('User Disconnected');
        });

        //Chat Message was sent to server
        socket.on('socket_chatSendMessage', function (message) {
            var sanitizedObject = sanitizeMessage(message);

            //Validate and Sanitize Message
            if (sanitizedObject.error) {
                socket.emit('socket_chatError', sanitizedObject);
                return;
            }

            //Validate user is signed in
            if (!socket.handshake.session.username) {
                socket.emit('socket_chatError', {error: 'You must be signed in!'});
                return;
            }

            var bodyMessage = sanitizedObject.message;
            commitMessage(message, socket, function (err, data) {
                if (err) {
                    socket.emit('socket_chatError', {error: err});
                } else {
                    //console.log("Sending message to chatroom: " + socket.handshake.session.chatroom);
                    io.in(socket.handshake.session.chatroom).emit('socket_chatMessage', {
                            date_created : data,
                            bodyMessage: bodyMessage,
                            avatar: socket.handshake.session.avatarPath,
                            username:  socket.handshake.session.username,
                        });
                }
            });
        });

        socket.on('socket_chatAttemptToJoinRoom', function(obj){
            joinChatRoom(obj.chatroomID, socket);
        });
    });
}

//Sanitize message and parse BB Code
//If the message is invalid, return object with error message
var maxLength = config.defaults.maxChatMessageLength;
function sanitizeMessage(message) {
    var sanitizedObject = {};
    if (message === null || message === '') {
        sanitizedObject.error = 'No message specified!';
    } else if (message.length > maxLength) {
        sanitizedObject.error = 'Message is too long, max length: ' + maxLength + '!';
    } else {
        sanitizedObject.message = parser.parseString(xssFilters.inHTMLData(message));
    }
    return sanitizedObject;
}

//Store the raw message into the database
function commitMessage(message, socket, callback) {
    chatMessage.createMessage(message, socket.handshake.session.uid, socket.handshake.session.chatroom, function (err) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, new Date());
        }
    });
}

//Join a chat room
function joinChatRoom(chatroomID, socket){
    chatRoom.getChatRoomInfo(chatroomID, function(err, data){
        if(err){
            return callback(err);
        } else {
            if(data.length == 0){
                socket.emit('socket_chatError', {error: err});
            } else {
                //Leave the previous chat room, if it exists
                if(socket.handshake.session.chatroom){
                    socket.leave(socket.handshake.session.chatroom);
                }

                //Update this user's current room
                socket.handshake.session.chatroom = chatroomID;
                socket.join(chatroomID);

                var data = data[0];
                data.name = xssFilters.inHTMLData(data.name);
                data.description = xssFilters.inHTMLData(data.description);
                data.owner = xssFilters.inHTMLData(data.username);

                //Send chat room info
                socket.emit('socket_chatLoadChatRoomInfo', data);

                //Load chat room messages
                getChatRoomMessages(chatroomID, function (err, data) {
                    if (err) {
                        socket.emit('socket_chatError', {error: err});
                    } else {
                        socket.emit('socket_chatLoadChatRoomMessages', data);
                    }
                });
            }
        }
    });
}

//Get all the chat rooms
function getChatRooms(callback){
    chatRoom.getChatRooms(function(err, data){
        if(err){
            return callback(err);
        } else {
            //Sanitize the chat room names
            for(index in data){
                data[index].name = xssFilters.inHTMLData(data[index].name);
                if(data[index].password && data[index].password !== ""){
                    data[index].password = true;
                }
            }

            callback(null, data);
        }
    });
}

//Get messages from the database, sanitize all messages
function getChatRoomMessages(chatroomID, callback) {
    chatRoom.getMessages(chatroomID, function (err, data) {
        if (err) {
            return callback(err);
        } else {
            //Sanitize messages and parse BB Code
            for (index in data) {
                data[index].message = parser.parseString(xssFilters.inHTMLData(data[index].message));
            }

            return callback(null, data);
        }
    });
}