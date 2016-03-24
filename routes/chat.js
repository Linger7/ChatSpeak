/**
 * ChatSpeak JavaScript File
 * https://github.com/Linger7/ChatSpeak
 */
module.exports = function(io){

    io.on('connection', function(socket){
        console.log('User Connected');
        console.log(socket.handshake.session);

        socket.on('disconnect', function(){
            console.log('User disconnected');
        });
    });
}