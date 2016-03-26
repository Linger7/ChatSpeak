/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var mysqlConnection = require('../utilities/mysqlConnection.js');
var pool = mysqlConnection();
var config = require('../config/config.js');
var exports = {};

exports.getMessages = function(chatroomID, callback){
    pool.getConnection(function (err, connection) {
        connection.query('SELECT username, avatar_path as avatar, message, CHATMESSAGES.date_created FROM (SELECT message, user_uid, date_created FROM chat_message WHERE chat_room_uid = ?) AS CHATMESSAGES, user AS USERTABLE WHERE CHATMESSAGES.user_uid = USERTABLE.uid ORDER BY CHATMESSAGES.date_created LIMIT ?', [chatroomID, config.defaults.maxChatMessagesHistoryToLoad], function (err, rows, fields) {
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