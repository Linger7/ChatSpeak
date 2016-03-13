var mainURL = "http://" + window.location.host + "/";
$(document).ready(function(){

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

function ajaxModalCall(path){
    $.ajax({
        url: mainURL + path,
        type: 'GET'
    }).done(function(data) {
        $('#mainModal').modal('show');
        $('#mainModalTitle').html(data.title);
        $('#mainModalBody').html(data.body);
    });

    event.preventDefault();
    return false;
}