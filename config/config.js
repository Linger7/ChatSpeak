/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var config = {};

config.mysqlParams = {
    host                : 'localhost',
    user                : 'root',
    password            : '',
    connectionLimit     : 100,
    database            : 'chatspeak',
    checkExpirationInterval: 900000,// How frequently expired sessions will be cleared; milliseconds.
    expiration: 86400000,// The maximum age of a valid session; milliseconds.
    createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}

config.defaults = {};

config.defaults.usergroup = 1;
config.defaults.avatarPath = "images/default/avatar.png";
config.defaults.logo = "images/logos/logo.png";
config.defaults.maxChatMessageLength = 200;
config.defaults.maxChatMessagesHistoryToLoad = 250;
config.defaults.defaultChatRoom = 2;

module.exports = config;