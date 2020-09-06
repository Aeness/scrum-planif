var debug = require('debug')('scrum-planif:serverIo')

module.exports = {
    app: null,
    // TODO : remove attribut when a room is closed
    playersByRoom: {},

    launchTheRooms: function(app, io){
        this.app = app;

        io.on('connection', (socket) => {
            
            // Check if the connection is for this kind of room
            if (socket.handshake.query.planif) {
                var planif_ref = socket.handshake.query.planif;

                // TODO check the socket is not on another room
                // if yes, don't let it to join

                socket.join(this.getRoomName(planif_ref),(err) => {
                    if (err == null) {
                        
                        debug("%s join the planif room %s.", socket.id, planif_ref);
                        
                    }
                });

                ///////
                // list of "messages" which can be emit by a client

                socket.on('ask_to_join_planif', (player, acknowledgement) => {
                    if (this.playersByRoom[planif_ref] === undefined) {
                        this.playersByRoom[planif_ref] = {};
                    }
                    this.playersByRoom[planif_ref][player.ref] = player;
                    
                    // Send the information to all client
                    // socket io docs emit-cheatsheet
                    this.sendPlayerJoinPlanif(planif_ref,player);

                    acknowledgement(null, this.playersByRoom[planif_ref]);
                });
            }
        });
    },
    getRoomName: function (planif_ref) {
        return "planif_" + planif_ref;
    },

    ///////
    // list of "messages" which can be emit by the server to the clients
    sendPlayerJoinPlanif: function (planif_ref, player) {
        debug('sendPlayerJoinPlanif to planif:' + planif_ref + JSON.stringify(player));
        this.app.io.to(this.getRoomName(planif_ref)).emit('player_join_planif', {player: player});
    },
}
