/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var mysql				= require('mysql');
var config			= require('../config/config.js');

var createConnection = function(){
    var pool =  mysql.createPool(config.mysqlParams);
    return pool
}

module.exports = createConnection;