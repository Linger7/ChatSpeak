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
        console.log('User Connected');
        console.log(socket.handshake.session);

        //Load previous messages for this chat room
        getChatRoomMessages(2, function (err, data) {
            if (err) {
                socket.emit('socket_chatError', {error: err});
            } else {
                if (data.length != 0) {
                    socket.emit('socket_chatLoadChatRoomMessages', data);
                }
            }
        });

        socket.on('disconnect', function () {
            console.log('User disconnected');
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
            var prefixMessage = getPrefixMessage(socket);
            var suffixMessage = "<br />";

            commitMessage(message, socket, function (err) {
                if (err) {
                    socket.emit('socket_chatError', {error: err});
                } else {
                    io.emit('socket_chatMessage',
                        {
                            bodyMessage: bodyMessage,
                            prefix: prefixMessage,
                            suffix: suffixMessage
                        });
                }
            });
        });

        //socket.on
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

//Get the prefix before a message
//Prefix: Username followed by colon
function getPrefixMessage(socket) {
    return socket.handshake.session.username + ": ";
}

//Store the raw message into the database
function commitMessage(message, socket, callback) {
    //TODO get chatroom id
    chatMessage.createMessage(message, socket.handshake.session.uid, 2, function (err) {
        if (err) {
            return callback(err);
        } else {
            return callback(null);
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