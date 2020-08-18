var debug = require('debug')('scrum-planif:serverIo')

module.exports = {
    app: null,
    players: {},

    launchTheRoom: function(app, io){
        this.app = app;

        io.on('connection', (socket) => {
            
            // Check if the connection is for this room
            if (socket.handshake.query.planif) {
                var planif_ref = socket.handshake.query.planif;

                socket.join("planif_" + planif_ref,(err) => {
                    if (err == null) {
                        
                        debug("A client join the planif room " + planif_ref + "with id " + socket.id);
                        
                    }
                });

                ///////
                // list of "messages" which can be emit by A client

                socket.on('ask_to_join_planif', (player) => {
                    this.players[player.ref] = player;
                    
                    // Send the information to all client
                    this.sendPlayerJoinPlanif(planif_ref,player);
                });

                socket.on('ask_players', () => {

                    // Send just for this new client
                    socket.emit('players_' + planif_ref, this.players);
                });


            }
        });
    },

    ///////
    // list of "messages" which can be emit by the server to the clients
    sendPlayerJoinPlanif: function (planif_ref,player) {
        debug('sendPlayerJoinPlanif to planif:' + planif_ref + JSON.stringify(player));
        this.app.io.to('planif_' + planif_ref).emit('player_join_planif', {player: player});
    },
}