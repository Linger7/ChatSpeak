var mainURL = "http://" + window.location.host + "/";
$(document).ready(function(){
    loadNavBarDropDownMenu();
});

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
    $('#chatAreaExtraSpaceContainer').height(secondRowHeight);

    //Adjust First Row, Second Column Height (Chat Participants and Chat Room List)
    $('#chatAreaSecondContainer').height(firstRowHeight);
    $('#chatAreaParticipantsContainer').height(firstRowHeight * 0.50);
    $('#chatAreaRoomListContainer').height(firstRowHeight * 0.50);

});

var tempUserName;
function ajaxModalCall(path, errorMessage){
    $.ajax({
        url: mainURL + path,
        data: {username : $('#inputUserName').val()},
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

function setModalToLoading(){
    $('#mainModal').modal('show');
    $('#mainModalTitle').html('Loading...');
    $('#mainModalBody').html('<div class="center"><i class="fa fa-refresh fa-spin fa-5x"></i></div>');
}

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