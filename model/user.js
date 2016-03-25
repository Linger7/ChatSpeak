/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var mysqlConnection = require('../utilities/mysqlConnection.js')
var pool = mysqlConnection();
var config = require('../config/config.js');
var exports = {};

//Return user information
exports.getUserInfo = function(userID, callback){
    pool.getConnection(function(err, connection) {
        connection.query('SELECT uid, username, email, avatar_path, usergroup_uid, date_created FROM USER WHERE uid = ?', [userID], function (err, rows, fields) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                if(rows.length != 0) {
                    return callback(null, generateUserObject(rows[0].uid, rows[0].username, rows[0].email, rows[0].avatar_path, rows[0].usergroup_uid, rows[0].date_created));
                } else {
                    return callback("No such user found!");
                }
            }
        });
    });
}

//Update User Avatar
exports.updateUserAvatar = function(userID, filePath, callback){
    pool.getConnection(function(err, connection){
        connection.query("UPDATE user SET avatar_path = ? WHERE uid = ?", [filePath, userID], function(err, rows, fields){
            if(err){
                console.log(err);
                return callback(err, null);
            } else {
                return callback(null, "Success");
            }
        });
    });
}

//Returns password and account information for validation of a sign in
exports.getLoginInformation = function(username, callback){
    pool.getConnection(function(err, connection) {
        connection.query('SELECT password, uid, username, avatar_path FROM user WHERE username = ?', [username],function(err, rows, fields){
            if(err){
                console.log(err);
                return callback("Currently experiencing database issues, please try again later!", null);
            } else {
                if(rows.length != 0){
                    var loginData = {};
                    loginData.password = rows[0].password;
                    loginData.uid = rows[0].uid;
                    loginData.username = rows[0].username;
                    loginData.avatarPath = rows[0].avatar_path;

                    return callback(null, loginData);
                } else {
                    return callback("No such username!", null);
                }
            }
        });
    });
}

exports.createUser = function(username, hashedPW, email, ipAddress, callback){
    pool.getConnection(function (err, connection) {
        connection.query('INSERT INTO user (username, password, email, usergroup_uid, ip_address, avatar_path) VALUES (?, ?, ?, ?, ?, ?)', [username, hashedPW, email, config.defaults.usergroup, ipAddress, config.defaults.avatarPath], function (err, rows, fields) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    var errorMessage = String(err.message);
                    if (errorMessage.indexOf(userName) > -1) {
                        return callback('The username ' + username + ' is already taken!', null);
                    } else if (errorMessage.indexOf(email) > -1) {
                        return callback('The email address ' + email + ' is already taken!', null);
                    } else {
                        return callback('A database issue occurred! ' + err.message, null);
                    }
                } else {
                    return callback('A database issue occurred! ' + err.message, null);
                }
            } else {
                var customResponseObject = {};
                customResponseObject.state = "Success";
                customResponseObject.title = "<i class='fa fa-thumbs-up'></i> Congratulations!";
                customResponseObject.avatarPath = config.defaults.avatarPath;
                customResponseObject.username = username;
                return callback(null, customResponseObject);
            }
        });
    });
}

//Generate a user object
function generateUserObject(id, username, email, avatar_path, usergroup, date_created){
    var user = {};
    user.id = id;
    user.username = username;
    user.email = email;
    user.avatarPath = avatar_path;
    user.usergroup = usergroup;
    user.date_created = date_created;

    return user;
}

module.exports = exports;