var mainURL = "http://" + window.location.host + "/";
$(document).ready(function(){
    loadNavBarDropDownMenu();

    //Resize based on browser height
    $(window).on("load", function() {
        var viewPortHeight = $(window).height();
        var navbarContainerHeight = $('#navbarContainer').height();
        var adjustedHeight = viewPortHeight - navbarContainerHeight;

        //Adjust Two Primary Rows
        var firstRowHeight = adjustedHeight * 0.75;
        var secondRowHeight = adjustedHeight * 0.25;

        $('#firstRow').height(firstRowHeight);
        $('#secondRow').height(secondRowHeight);

        //Adjust Containers to be full height
        $('#chatAreaContainer').height(firstRowHeight);
        $('#chatAreaInputContainer').height(secondRowHeight);
        $('#chatAreaCurrentRoomInfoContainer').height(secondRowHeight);

        //Adjust First Row, Second Column Height (Chat Participants and Chat Room List)
        $('#chatAreaSecondContainer').height(firstRowHeight);
        $('#chatAreaParticipantsContainer').height(firstRowHeight * 0.50);
        $('#chatAreaRoomListContainer').height(firstRowHeight * 0.50);
    });
});

function ajaxModalCall(path, inputData, errorMessage){
    var data = null;

    //TODO, redo
    if(inputData !== null){
        if(inputData === "username"){
            data = {username : $('#inputUserName').val()};
        }
    }

    $.ajax({
        url: mainURL + path,
        data: data,
        type: 'GET'
    }).done(function(data) {
        $('#mainModal').modal('show');
        $('#mainModalTitle').html(data.title);
        $('#mainModalBody').html(data.body);
        if(errorMessage){
            $('#errorDisplay').html(errorMessage).show();
        }
    });
    setModalToLoading();

    event.preventDefault();
    return false;
}

//Change Modal to Loading
function setModalToLoading(){
    $('#mainModal').modal('show');
    $('#mainModalTitle').html('Loading...');
    $('#mainModalBody').html('<div class="center"><i class="fa fa-refresh fa-spin fa-5x"></i></div>');
}

//Logout call
function callLogOut(){
    $.ajax({
        url: mainURL + "accounts/logout",
        type: 'GET'
    }).done(function(data) {
        if(data == 1){
            location.reload();
        } else {
            alert('Unable to log out, error!');
        }
    });
}

//Gets navbar drop drop menu options
function loadNavBarDropDownMenu(){
    //If the dropdown exists in the navbar, load dropdown options
    if($('#navBarDropLink').length) {
        $.ajax({
            url: mainURL + "profile/navbar",
            type: 'GET'
        }).done(function (data) {
            $('#navbarDropDown').append(data);
        });
    }
}

//Updates the navbar after registration or sign in, to reflect correct information
function updateNavBar(username, avatarPath){
    var link = $('#navBarLink');
    link.addClass('dropdown-toggle');
    link.attr('id', 'navBarDropLink');
    link.attr('onclick', '');
    link.attr('data-toggle', 'dropdown');
    link.attr('role', 'button');
    link.attr('aria-haspopup', true);
    link.attr('aria-expanded', false);

    //Add avatar and alter username
    link.empty();
    link.append('<img src="' + avatarPath + '" id="navbarAvatar" class="img-circle"/>');
    link.append('<span id="navbarUsername">' + username + '</span>');

    loadNavBarDropDownMenu();
}

var selectedText = "";
var selectedStart = 0;
var selectedEnd = 0;

//Create a BB Tag
$('.bbButton').click(function(){
    var id = $(this).attr('type');
    var textInput = $('#chatAreaChatBox');
    var currentText = textInput.val();

    //If text is within the chatarea was selected, add the tags around the selected text
    if(selectedText !== ""){
        var beforeText = currentText.substring(0, selectedStart);
        var afterText = currentText.substring(selectedEnd);

        textInput.val(beforeText + '[' + id + ']' + selectedText + '[/' + id + ']' + afterText);
    } else {
        textInput.val(currentText + '[' + id +'][/' + id + ']');
    }

    selectedText = "";
});


//Store user selection in chatarea input
$('#chatAreaChatBox').mouseup(function(){
    selectedText = this.value.substring(this.selectionStart, this.selectionEnd);
    selectedStart = this.selectionStart;
    selectedEnd = this.selectionEnd;
});

//Update the time on chat box messages to be a new relative message every 30 seconds
setInterval( function(){
    $('.chatTimeText').each(function(index, obj){
        obj.innerHTML = moment($(this).attr('time')).fromNow() + " - ";
    });
}, 30000);


function showErrors(errors){
    var errorDisplay = $('#errorDisplay');
    errorDisplay.html('');
    errorDisplay.show();
    errorDisplay.append('<ul>');
    for (index in errors) {
        errorDisplay.append('<li>' + errors[index] + '</li>');
    }
    errorDisplay.append('</ul>');
};