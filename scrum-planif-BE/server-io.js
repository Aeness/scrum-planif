module.exports = function(app, server, corsOrigin) {

    this.debug = require('debug')('scrum-planif:serverIo');
    

    // https://socket.io/docs/v3/server-api/index.html
    /* CORS : default configuration :
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
    */
    var io = require('socket.io')(server, {
        allowEIO3: true,
        cors: {
            origin: corsOrigin,
            methods: ["GET", "POST"], //  Access-Control-Allow-Methods => Not working
            //allowedHeaders: ["my-custom-header"],
            //credentials: true // Access-Control-Allow-Credentials => Not using
        }
    });
    server.on('listening', () => {
        this.debug("IoServer is listening.");
    });

    io.on('connection', (socket) => {
        const version = socket.conn.protocol;
        this.debug("client version : " + version);
    });
    
    // List of rooms
    require('./rooms/planif').launchTheRooms(app,io);

    return io;

}