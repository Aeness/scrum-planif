var debug = require('debug')('scrum-planif:serverIo')

module.exports = {
    app: null,

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
                        
                        debug("%s open planif room %s.", socket.id, planif_ref);
                        var player = JSON.parse(socket.handshake.query.player);

                        let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                        if (room.players === undefined) {
                            room.players = {};
                        }
                        room.players[player.ref] = player;
    
                        socket.player = player;
                        
                        // Send the information to all client
                        // socket io docs emit-cheatsheet
                        this.sendPlayerJoinPlanif(planif_ref,player);
                        
                    }
                });

                ///////
                // list of "messages" which can be emit by a client

                socket.on('ask_players_list', (acknowledgement) => {
                  let room = socket.adapter.rooms[this.getRoomName(planif_ref)];

                  acknowledgement(null, room.players);
                });
                socket.on('disconnecting', () => {
                    debug("%s disconnecting", socket.id);
                    let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                    
                    if (room.players !== undefined) {
                        delete room.players[socket.player.ref];
                    }
                    this.sendPlayerQuitPlanif(planif_ref, socket.player.ref)
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

    sendPlayerQuitPlanif: function(planif_ref, player_ref) {
        debug('sendUserQuitPlanif to planif %s : %s', planif_ref, player_ref);
        this.app.io.to(this.getRoomName(planif_ref)).emit('player_quit_planif', { player_ref: player_ref });
    },
}
