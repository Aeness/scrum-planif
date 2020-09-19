module.exports = function(app, server) {

    this.debug = require('debug')('scrum-planif:serverIo');
    

    // https://socket.io/docs/server-api/
    var io = require('socket.io')(server);
    server.on('listening', () => {
        this.debug("IoServer is listening.");
    });

    io.on('authorization', (/*socket*/) => {
        this.debug("authorization pour io");
    });
/*
    io.on('connection', (socket) => {
        this.debug("Someone wants to join a room " + JSON.stringify(socket.handshake.query));
        
        socket.on('disconnect', () => {

            this.debug("%s disconnect", socket.id);
            this.debug("%j", socket.rooms);
            //this.debug("Someone disconnect from the " + JSON.stringify(socket.rooms));
            socket.leaveAll();
        });
    });
*/
    // List of rooms
    require('./rooms/planif').launchTheRooms(app,io);

    return io;

}