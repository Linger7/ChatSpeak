/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var exports = {};

//Create JSON Object with the Modal Title and Body
exports.generateResponseObject = function(title, content){
    var responseObject = {};
    responseObject.title = title;
    responseObject.body = content;

    return responseObject;
};

exports.generateErrorObject = function(message){
    var responseObject = {};
    responseObject.state = "Failed";
    responseObject.message = message;
    return responseObject;
};


module.exports = exports;