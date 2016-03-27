/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var mysqlConnection = require('../utilities/mysqlConnection.js');
var pool = mysqlConnection();
var config = require('../config/config.js');
var exports = {};

exports.getChatRoomInfo = function(chatroomID, callback){
    pool.getConnection(function (err, connection) {
        connection.query('SELECT username, name, description, priority FROM (SELECT * FROM chat_room WHERE uid = ?) AS CHATROOM, user AS USERTABLE WHERE USERTABLE.uid = CHATROOM.owner_uid', [chatroomID], function (err, rows, fields) {
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

exports.getChatRooms = function(callback){
    pool.getConnection(function (err, connection) {
        connection.query('SELECT uid AS chatroomID, name, password, priority FROM chat_room ORDER BY PRIORITY DESC', function (err, rows, fields) {
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

module.exports = exports;