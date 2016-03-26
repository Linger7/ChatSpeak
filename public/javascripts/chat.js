/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var socket = io.connect('http://localhost');
socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});

//Received an error message
socket.on('socket_chatError', function(obj){
    alert(obj.error);
});

//Received a message from the server
socket.on('socket_chatMessage', function(obj){
    appendToChat(obj.avatar, obj.date_created, obj.username, obj.bodyMessage);
    scrollToBottomOfChat();
});

//Received chat room message history from server
socket.on('socket_chatLoadChatRoomMessages', function(obj){
    for(index in obj){
        appendToChat(obj[index].avatar, obj[index].date_created, obj[index].username, obj[index].message);
    }
    scrollToBottomOfChat();
});

//Reconnect socket
function socketIOReconnect(){
    console.log("socketIOReconnect()");
    if(socket) socket.io.disconnect();
    socket = io.connect('http://localhost');
}

//Chat Box Enter Pressed
$('#chatAreaChatBox').keydown(function(event){
    if(event.keyCode == 13){
        chatSendMessage($(this));
    }
});

//Chat Box Send Button Pressed
$('#chatAreaChatSubmit').click(function(event){
    chatSendMessage($('#chatAreaChatBox'));
});

//Send Message
function chatSendMessage(element){
    var message = element.val();

    if(message === null || message === ""){
        return;
    }

    socket.emit('socket_chatSendMessage', message);
    element.val('');
}

//Append to the chatbox
function appendToChat(avatar, time, username, body){
    var chatArea = $('#chatArea');
    chatArea.append(
        "<img src='" + avatar + "' class='chatAvatar'/> " +
        "<small class='chatTimeText' time='" + time + "'>" + moment(time).fromNow() + " - </small> " +
        username + ": " +
        body +
        "<br />"
    );
}


//From: http://stackoverflow.com/questions/3742346/use-jquery-to-scroll-to-the-bottom-of-a-div-with-lots-of-text
var height = 0;
function scrollToBottomOfChat(){
    var wtf = $('#chatArea');

    height = height < wtf[0].scrollHeight ? wtf[0].scrollHeight : 0;
    scroll.call(wtf, height, this);
}

function scroll(height, ele) {
    this.stop().animate({ scrollTop: height }, 1000, function () {
        var dir = height ? "top" : "bottom";
        $(ele).html("scroll to "+ dir).attr({ id: dir });
    });
};