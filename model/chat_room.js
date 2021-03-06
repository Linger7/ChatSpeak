/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var mysqlConnection = require('../utilities/mysqlConnection.js');
var pool = mysqlConnection();
var config = require('../config/config.js');
var exports = {};

//Get information pertaining to this chat room
exports.getChatRoomInfo = function(chatroomID, callback){
    pool.getConnection(function (err, connection) {
        connection.query('SELECT USERTABLE.uid as userID, CHATROOM.uid as roomID, username, name, CHATROOM.password as CHATROOMPASSWORD, description, priority FROM (SELECT * FROM chat_room WHERE uid = ?) AS CHATROOM, user AS USERTABLE WHERE USERTABLE.uid = CHATROOM.owner_uid', [chatroomID], function (err, rows, fields) {
            connection.destroy();
            if(err){
                console.log(err);
                return callback("DB Error: " + err, null);
            } else {
                return callback(null, rows);
            }
        });
    });
}

//Get all chat rooms
exports.getChatRooms = function(callback){
    pool.getConnection(function (err, connection) {
        connection.query('SELECT uid AS chatroomID, name, password, priority FROM chat_room ORDER BY PRIORITY DESC, DATE_CREATED', function (err, rows, fields) {
            connection.destroy();
            if(err){
                console.log(err);
                return callback("DB Error: " + err, null);
            } else {
                return callback(null, rows);
            }
        });
    });
}

//Create a chat room
exports.createChatRoom = function(name, password, description, owner, callback){
    pool.getConnection(function(err, connection){
       connection.query('INSERT INTO chat_room (name, password, description, priority, owner_uid) VALUES (?, ?, ?, ?, ?)', [name, password, description, config.defaults.defaultChatRoomPriority, owner], function(err, rows, fields){
           if(err){
               console.log(err);
               if (err.code === 'ER_DUP_ENTRY') {
                   return callback('Chat Room name: ' + name + ' already exists!');
               } else {
                   return callback("DB Error: " + err);
               }
           } else {
               //Return the chat room ID
               return callback(null, rows.insertId);
           }
       });
    });
}

//Get messages for a specific chat room
exports.getMessages = function(chatroomID, callback){
    pool.getConnection(function (err, connection) {
        connection.query('SELECT username, avatar_path as avatar, message, CHATMESSAGES.date_created FROM (SELECT message, user_uid, date_created FROM chat_message WHERE chat_room_uid = ?) AS CHATMESSAGES, user AS USERTABLE WHERE CHATMESSAGES.user_uid = USERTABLE.uid ORDER BY CHATMESSAGES.date_created LIMIT ?', [chatroomID, config.defaults.maxChatMessagesHistoryToLoad], function (err, rows, fields) {
            connection.destroy();
            if(err){
                console.log(err);
                return callback("DB Error: " + err, null);
            } else {
                return callback(null, rows);
            }
        });
    });
}

//Delete a specific chat room
exports.deleteChatRoom = function(chatroomID, userID, callback){
    pool.getConnection(function (err, connection) {
        connection.query('DELETE FROM chat_room WHERE uid = ? AND owner_uid = ?', [chatroomID, userID], function (err, rows, fields) {
            connection.destroy();
            if(err){
                console.log(err);
                return callback("DB Error: " + err, null);
            } else {
                return callback(null, rows);
            }
        });
    });
}

module.exports = exports;