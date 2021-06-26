module.exports = function(app, server, corsOrigin) {

    this.debug = require('debug')('scrum-planif:serverIo');
    

    // https://socket.io/docs/v4/server-api/index.html
    // https://www.npmjs.com/package/cors
    /* CORS : default configuration :
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
    */
    var io = require('socket.io')(server, {
        cors: {
            origin: corsOrigin,
            methods: ["GET", "POST"], //  Access-Control-Allow-Methods => Not working
            //allowedHeaders: ["Authorization"],
            //credentials: true // Access-Control-Allow-Credentials => Not used
        }/*,
        allowRequest: (data, callback) => {
            // Only called at the (first request) handshake 
            // The error send by callback(err) is not the same that the client receive
            // Use io.use() and middleware error instead

            //inform the callback of auth failure
            // return callback(new Error("User not found"));
            //inform the callback of auth success
            return callback(null, true);
        }*/
    });
    server.on('listening', () => {
        this.debug("IoServer is listening.");
    });

    io.use((socket, next) => {
        // Only called at the first request

        let jwt = require('jsonwebtoken');
        try {
            // TODO : Move socket.handshake.query.jwt to socket.handshake.auth.jwt
            let decoded = jwt.verify(socket.handshake.query.jwt, app.set('tokensecret'));

            if (decoded.ref === undefined || decoded.name === undefined) {
                // inform the callback of auth failure
                let err = new Error("Not enough information.");
                err.data = {auth: true};
                return next(err);
            }
        } catch(err) {
            this.debug("wrong jwt : %s.", err.message);
            // inform the callback of auth failure
            err.data = {auth: true};
            return next(err);
        }
        this.debug("jwt Ok !!!!!!!");
        // TODO : socket.user = user;
        // just call next
        next();
      });

    io.on('connection', (socket) => {
        const version = socket.conn.protocol;
        this.debug("client version : " + version);
    });
    
    // List of rooms
    require('./rooms/planif').launchTheRooms(app,io);

    return io;

}