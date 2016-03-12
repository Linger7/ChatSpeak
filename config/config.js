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
    database            : 'chatspeak'
}

config.defaults = {};

config.defaults.usergroup = 1;

module.exports = config;