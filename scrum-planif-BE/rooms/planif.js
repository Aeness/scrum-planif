var debug = require('debug')('scrum-planif:serverIo')

module.exports = {
    app: null,

    launchTheRooms: function(app, io){
        this.app = app;

        /**
         * One socket <=> One player
         * One socket  => One planif
         */
        io.on('connection', (socket) => {
            
            // Check if the connection is for this kind of room
            if (socket.handshake.query.planif) {
                var planif_ref = socket.handshake.query.planif;

                // TODO check the socket is not on another room
                // if yes, don't let it to join

                socket.join(this.getRoomName(planif_ref),(err) => {
                    if (err == null) {
                        
                        debug("%s open planif room %s.", socket.id, planif_ref);

                        let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                        if (room.players === undefined) {
                            room.players = new Map();
                        }
    
                        var participant = JSON.parse(socket.handshake.query.player);
                        socket.participant = participant;
                    }
                });

                ///////
                // list of "messages" which can be emit by a client

                socket.on('join_planif', () => {
                    debug("%s plays in planif room %s.", socket.id, planif_ref);
                    // TODO what happen if the room not exists ?
                    let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                    var player = JSON.parse(socket.handshake.query.player);
                    
                    room.players.set(player.ref, player);
  
                        
                    // Send the information to all client
                    // socket io docs emit-cheatsheet
                    this.sendPlayerJoinPlanif(planif_ref,player);
                });

                socket.on('leave_planif', () => {
                      debug("%s does not play in planif room %s.", socket.id, planif_ref);
                      // TODO what happen if the room not exists ?
                      let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                      if (room.players !== undefined && room.players.delete(socket.participant.ref)) {
                          this.sendPlayerLeavePlanif(planif_ref, socket.participant.ref)
                      }
                });

                socket.on('ask_players_list', (acknowledgement) => {
                    debug("%s %s ask_players_list for room %s.", socket.id, socket.participant.ref, planif_ref);
                    let room = socket.adapter.rooms[this.getRoomName(planif_ref)];

                    let reponseTS = {};
                    for (let entry of room.players.entries()) {
                        reponseTS[entry[0]] = entry[1];
                    }

                  acknowledgement(null, reponseTS);
                });
                socket.on('disconnecting', () => {
                    debug("%s disconnecting", socket.id);
                    let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                    if (room.players !== undefined && room.players.delete(socket.participant.ref)) {
                        this.sendPlayerLeavePlanif(planif_ref, socket.participant.ref)
                    }
                });

                socket.on('player_choose', (data) => {
                    debug("%s choose %s", socket.id, data.choosenValue);
                    this.sendPlayerChoose(planif_ref, socket.participant.ref, data.choosenValue)
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

    sendPlayerLeavePlanif: function(planif_ref, player_ref) {
        debug('sendPlayerLeavePlanif to planif %s : %s', planif_ref, player_ref);
        this.app.io.to(this.getRoomName(planif_ref)).emit('player_leave_planif', { player_ref: player_ref });
    },

    sendPlayerChoose: function(planif_ref, player_ref, choosenValue) {
        debug('sendPlayerChoose to planif %s : %s', planif_ref, choosenValue);
        this.app.io.to(this.getRoomName(planif_ref)).emit('player_choose', { player_ref: player_ref, choosenValue: choosenValue});
    },
}