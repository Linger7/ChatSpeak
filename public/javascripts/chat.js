/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
var socket = io.connect('http://localhost');

//Received update on total users in chat
socket.on('socket_chatTotalParticipantCount', function(count){
   $('#ChatRoomsTotalUsers').html(count);
});

//TODO Optimize this to one call
//Received update on total users in a specific chat room
socket.on('socket_chatTotalChatCount', function(count){
    if(!count) count = 0;
    $('#ChatRoomsCurrentChatUsers').html(count);
});

//Received update on total users in a specific chat room for list
socket.on('socket_chatTotalChatCountListUpdate', function(obj){
    $('#' + obj.chatroomID + 'Row').html(obj.participants);
});

//Received an error message
socket.on('socket_chatError', function(obj){
    $('#mainModal').modal('show');
    $('#mainModalTitle').html('<i class="fa fa-exclamation-triangle red"></i> Oops, something went wrong!');
    $('#mainModalBody').html(obj.error);
});

//Received a message from the server
socket.on('socket_chatMessage', function(obj){
    appendToChat(obj.avatar, obj.date_created, obj.username, obj.bodyMessage);
    scrollToBottomOfChat();
});

//Load a specific chat room's descriptive information
socket.on('socket_chatLoadChatRoomInfo', function(obj){
    $('#chatAreaChatRoomName').html(obj.name);
    $('#chatAreaDescription').html(obj.description);
    $('#chatAreaOwner').html(obj.owner);
});

//Load all chat rooms
socket.on('socket_chatLoadAllChatRooms', function(obj){
    //Clear previous chat rooms (should never be any)
    $('#ChatRoomsContainer').html("");

    for(index in obj){
        addChatRoomToList(obj[index]);
    }
});

//A new chat room was created and broadcasted
socket.on('socket_chatSendNewChatRoom', function(obj){
    addChatRoomToList(obj);
});

function addChatRoomToList(obj) {
    var hasPassword = false;
    var passwordText = '';
    if (obj.password) {
        hasPassword = true;
        passwordText = '<i class="fa fa-lock"></i>';
    }
    $('#ChatRoomsContainer').append('<div class="chatRoomRow" hasPassword="' + hasPassword + '" id="' + obj.chatroomID + '" chatroomID="' + obj.chatroomID + '" onclick="attemptToJoinChatRoom(this)">' + obj.name +
        '<span class="floatRight" style="padding-left: 5px;">' + passwordText + '</span>' +
        '<span class="floatRight badge" id="' + obj.chatroomID + 'Row">0</span></div>');
}

//Received chat room message history from server
socket.on('socket_chatLoadChatRoomMessages', function(obj){
    //Clear previous messages
    $('#chatArea').html("");

    //Remove previous active chat room
    $('.chatRoomActiveRow').removeClass('chatRoomActiveRow');

    //Set this chat room row to be active
    $('#' + obj.currentRoom).addClass('chatRoomActiveRow');

    //Scroll to this chat room in the list
    $('#ChatRoomsContainer').animate({
        scrollTop: $('#' + obj.currentRoom).offset().top
    }, 3000);

    var messages = obj.messages;
    for(index in messages){
        appendToChat(messages[index].avatar, messages[index].date_created, messages[index].username, messages[index].message);
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
        "<a href='#' class='chatUserNameLink'>" + username + "</a>: " +
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

function attemptToJoinChatRoom(obj){
    var currentObj = $(obj);
    var chatroomID = currentObj.attr('chatroomID');
    var hasPassword = currentObj.attr('hasPassword');

    //Display Password Modal and pass the password to socket
    var dataToSend = {};
    dataToSend.chatroomID = chatroomID;
    dataToSend.password = "TODO";

    socket.emit('socket_chatAttemptToJoinRoom', dataToSend);
}

//Call Modal to Create New Chat Room
function callCreateNewChatRoom(){
    ajaxModalCall('chat/create/room');
}

//Create actual chat room
function createNewChatRoom(){
    var chatName = $('#inputChatRoomName').val();
    var chatPassword = $('#inputChatPassword').val();
    var chatPasswordConfirm = $('#inputConfirmPassword').val();
    var chatDescription = $('#inputDescription').val();
    var formData = $('#createRoomForm').serialize();

    //Do clientside validation
    var errors = [];
    if(chatName === null || chatName === ""){
        errors.push("You must enter a name for your chat room!");
    }

    if(chatName.length > 100){
        errors.push("Your chat room name must be under 100 characters, currently: " + chatName.length);
    }

    if(chatPassword !== chatPasswordConfirm){
        errors.push("Your passwords do not match!");
    }

    if(chatDescription.length > 5000){
        errors.push("Your room description must be under 5000 characters, currently: " + chatDescription.length);
    }

    if(errors.length > 0){
        showErrors(errors);
    } else {
        //Submit Registration Form
        $.ajax({
            url: "http://" + window.location.host + "/chat/create/room",
            type: 'POST',
            data: formData
        }).done(function (data) {
            if(data.state === "Failed"){
                errors.push(data.message);
                showErrors(errors);
            } else {
                $('#mainModal').modal('show');
                $('#mainModalTitle').html(data.title);
                $('#mainModalBody').html(data.body);
            }
        });
    }

    event.preventDefault();
    return false;
}