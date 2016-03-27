/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var mysqlConnection = require('../utilities/mysqlConnection.js');
var pool = mysqlConnection();
var config = require('../config/config.js');
var exports = {};

exports.createMessage = function(message, userID, chatroomID, callback){
    pool.getConnection(function (err, connection) {
        connection.query('INSERT INTO chat_message (state, message, user_uid, chat_room_uid) VALUES (?, ?, ?, ?)', [1, message, userID, chatroomID], function (err, rows, fields) {
            connection.destroy();
            if(err){
                return callback("DB Error: " + err);
            } else {
                return callback(null);
            }
        });
    });
}

module.exports = exports;