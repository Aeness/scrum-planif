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
                            room.name = null;
                        }
    
                        var participant = JSON.parse(socket.handshake.query.user);
                        socket.participant = participant;
                    }
                });

                socket.on('ask_planif_informations', (acknowledgement) => {
                    debug("%s %s ask_planif_informations for room %s.", socket.id, socket.participant.ref, planif_ref);
                    let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                    
                    let reponsePlayerTS = {};
                    for (let entry of room.players.entries()) {
                        reponsePlayerTS[entry[0]] = entry[1];
                    }
                    let reponse = {
                        ref : planif_ref,
                        name : room.name,
                        players : reponsePlayerTS
                    };
                    acknowledgement(null, reponse);
                });

                ///////
                // list of "messages" which can be emit by a client

                socket.on('join_planif', () => {
                    debug("%s plays in planif room %s.", socket.id, planif_ref);
                    // TODO what happen if the room not exists ?
                    let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                    var player = JSON.parse(socket.handshake.query.user);
                    player.vote = null;
                    
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

                socket.on('disconnecting', () => {
                    debug("%s disconnecting", socket.id);
                    let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                    if (room.players !== undefined && room.players.delete(socket.participant.ref)) {
                        this.sendPlayerLeavePlanif(planif_ref, socket.participant.ref)
                    }
                });

                socket.on('player_choose', (data) => {
                    debug("%s choose %s", socket.id, data.choosenValue);
                    let room = socket.adapter.rooms[this.getRoomName(planif_ref)];
                    if (room.players !== undefined && room.players.has(socket.participant.ref)) {
                        room.players.get(socket.participant.ref).vote = data.choosenValue;
                    }
                    this.sendPlayerChoose(planif_ref, socket.participant.ref, data.choosenValue)
                });

                socket.on('send_planif_name', (name) => {
                    socket.adapter.rooms[this.getRoomName(planif_ref)].name = name;
                    
                    // Send the information to all client
                    // socket io docs emit-cheatsheet
                    this.sendPlanifName(planif_ref,name);
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
    sendPlanifName: function (planif_ref, name) {
        debug('sendPlanifName to planif:' + planif_ref + " " + name);
        this.app.io.to(this.getRoomName(planif_ref)).emit('planif_name', {name: name});
    },
}
