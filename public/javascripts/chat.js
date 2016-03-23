/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
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
    element.val('');//Clear input box

    if(message === null || message === ""){
        return;
    }


}

//var chatArea = $('#chatArea');
//chatArea.append(createMessage(message));