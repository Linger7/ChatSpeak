/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var config = require('../config/config.js');
module.exports = function(io){

    io.on('connection', function(socket){
        console.log('User Connected');
        console.log(socket.handshake.session);

        socket.on('disconnect', function(){
            console.log('User disconnected');
        });

        socket.on('socket_chatSendMessage', function(message){
            var sanitizedObject = sanitizeMessage(message);
            if(sanitizedObject.error){
                socket.emit('socket_chatError', sanitizedObject);
                return;
            };

            var bodyMessage = sanitizedObject.message;
            var prefixMessage = getPrefixMessage(socket);
            var suffixMessage = "<br />";

            io.emit('socket_chatMessage',
            {
                bodyMessage: bodyMessage,
                prefix: prefixMessage,
                suffix: suffixMessage
            });
        });
    });
}

//TODO
var maxLength = config.defaults.maxChatMessageLength;
function sanitizeMessage(message){
    var sanitizedObject = {};
    if(message === null || message === ''){
        sanitizedObject.error = 'No message specified!';
    } else if(message.length > maxLength){
        sanitizedObject.error = 'Message is too long, max length: ' + maxLength + '!';
    } else {
        sanitizedObject.message = message;
    }
    return sanitizedObject;
}

var guestNumber = 1;
function getPrefixMessage(socket){
    var userData = socket.handshake.session;
    var prefixMessage;

    if(!userData.username){
        userData.username = "Guest" + guestNumber;
        guestNumber++;
    }
    prefixMessage = userData.username + ": ";

    return prefixMessage;
}