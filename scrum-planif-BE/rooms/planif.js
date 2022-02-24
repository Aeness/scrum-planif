var debug = require('debug')('scrum-planif:serverIo');
var jwt = require('jsonwebtoken');

module.exports = {
    app: null,
    planifRooms: new Map(),

    launchTheRooms: function(app, io){
        this.app = app;

        /**
         * One socket <=> One player
         * One socket  => One planif
         */
        io.on('connection', (socket) => {
            
            // Check if the connection is for this kind of room
            if (socket.handshake.query.planif) {

                // Check the jwt
                // Must not append if the client does its work
                socket.use((arg, next) => {
                    try {
                        jwt.verify(arg[1].jwt, this.app.set('tokensecret'));
                    } catch(err) {
                        debug("wrong jwt : %s.", err.message);
                        err.data = {auth: true};
                        // inform socket.on("error" of auth failure
                        next(err);
                        return;
                    }
                    next();
                  });

                  socket.on("error", (/*err*/) => {
                    
                    this.sendAuthenticationError(socket);
                  });

                let planif_ref = socket.handshake.query.planif;

                // TODO check the socket is not on another room
                // if yes, don't let it to join ==> io.use((socket, next)

                socket.join(this.getRoomName(planif_ref));
                        
                debug("%s open planif room %s.", socket.id, planif_ref);
                
                if(!this.planifRooms.has(this.getRoomName(planif_ref))) {
                    debug("INit");
                    let room = {};
                    room.players = new Map();
                    room.users = new Map();
                    room.name = null;
                    room.subject = null;
                    room.resultsVisibility = false;
                    room.choosenGameType = "classic";
                    room.cardsGames = new Map();
                    room.cardsGames.set("classic", this.getClassicCard());
                    room.cardsGames.set("TS", this.getTShirtCard());
                    room.cardsGames.set("ScrumLife", this.getScrumLifeCard());
                    this.planifRooms.set(this.getRoomName(planif_ref), room);
                }

                // The jwt has been checked in allowRequest
                // TODO move to io.use((socket, next)
                let decoded = jwt.verify(socket.handshake.query.jwt, app.set('tokensecret'));
                
                let role = {};
                role.isAdmin = (socket.handshake.query.admin == "true" || socket.handshake.query.admin == "1");
                role.isPlaying = false;

                let participant = {};
                participant.ref = decoded.ref;
                participant.name = decoded.name;
                participant.role = role;
                participant.vote = null;

                this.planifRooms.get(this.getRoomName(planif_ref)).users.set(participant.ref, participant);
                socket.participant = participant;

                this.sendUserJoinPlanif(planif_ref, participant);

                socket.on('ask_planif_informations', (data, acknowledgement) => {
                    debug("%s %s ask_planif_informations for room %s.", socket.id, socket.participant.ref, planif_ref);
                    let room = this.planifRooms.get(this.getRoomName(planif_ref));
                    
                    let reponseUsersTS = {};
                    for (let entry of room.users.entries()) {
                      reponseUsersTS[entry[0]] = entry[1];
                    }
                    
                    let reponsePlayerTS = {};
                    for (let entry of room.players.entries()) {
                        reponsePlayerTS[entry[0]] = entry[1];
                    }
                    
                    let cardsGamesTS = {};
                    for (let entry of room.cardsGames.entries()) {
                        cardsGamesTS[entry[0]] = entry[1];
                    }
                    let reponse = {
                        ref : planif_ref,
                        name : room.name,
                        subject: room.subject,
                        users : reponseUsersTS,
                        players : reponsePlayerTS,
                        resultsVisibility : room.resultsVisibility,
                        choosenGameType: room.choosenGameType,
                        cardsGame : cardsGamesTS,
                        me : participant
                    };
                    acknowledgement(null, reponse);
                });

                ///////
                // list of "messages" which can be emit by a client

                socket.on('join_planif', () => {
                    debug("%s plays in planif room %s.", socket.id, planif_ref);
                    // TODO what happen if the room not exists ?
                    let room = this.planifRooms.get(this.getRoomName(planif_ref));
                    var player = {};
                    player.ref = socket.participant.ref;
                    player.name = socket.participant.name;
                    player.vote = null;
                    player.socked_id = socket.id;
                    
                    room.players.set(player.ref, player);

                    room.users.get(player.ref).role.isPlaying = true;
                        
                    // Send the information to all client
                    // socket io docs emit-cheatsheet
                    this.sendPlayerJoinPlanif(planif_ref,player);
                });

                socket.on('leave_planif', () => {
                      debug("%s does not play in planif room %s.", socket.id, planif_ref);
                      // TODO what happen if the room not exists ?
                      let room = this.planifRooms.get(this.getRoomName(planif_ref));
                      if (room.players !== undefined && room.players.delete(socket.participant.ref)) {
                          this.sendPlayerLeavePlanif(planif_ref, socket.participant.ref)
                      }
                });

                socket.on('disconnecting', () => {
                    debug("%s disconnecting", socket.id);
                    let room = this.planifRooms.get(this.getRoomName(planif_ref));
                    if (room.players !== undefined ) {
                      room.players.delete(socket.participant.ref);
                    }
                    if (room.users !== undefined) {
                        room.users.delete(socket.participant.ref);
                        this.sendUserLeavePlanif(planif_ref, socket.participant.ref);
                    }
                    if (room.users !== undefined && room.users.size == 0) {
                        debug("last user leave planif room %s.", planif_ref);
                        this.planifRooms.delete(this.getRoomName(planif_ref));
                    }
                });

                socket.on('player_choose', (data) => {
                    debug("%s choose %s", socket.id, data.choosenValue);
                    let room = this.planifRooms.get(this.getRoomName(planif_ref));
                    if (room.players !== undefined && room.players.has(socket.participant.ref)) {
                        room.players.get(socket.participant.ref).vote = data.choosenValue;
                        if (room.users.has(socket.participant.ref)) {
                            room.users.get(socket.participant.ref).vote = data.choosenValue;
                        }
                    }
                    this.sendPlayerChoose(planif_ref, socket.participant.ref, data.choosenValue);
                });

                socket.on('restart_choose', () => {
                    debug("%s restart_choose", socket.id);
                    let room = this.planifRooms.get(this.getRoomName(planif_ref));
                    if (room.players !== undefined) {
                      for (let entry of room.players.entries()) {
                        entry[1].vote = null;
                        if (room.users.has(entry[1].ref)) {
                            room.users.get(entry[1].ref).vote = null;
                        }
                        this.sendPlayerRestart(planif_ref, entry[1].ref,entry[1].socked_id)
                      }
                    }
                });

                socket.on('send_planif_name', (data) => {
                    this.planifRooms.get(this.getRoomName(planif_ref)).name = data.name;
                    
                    // Send the information to all client
                    // socket io docs emit-cheatsheet
                    this.sendPlanifName(planif_ref,data.name);
                });

                socket.on('send_game_subject', (data) => {
                    this.planifRooms.get(this.getRoomName(planif_ref)).subject = data.subject;
                    
                    // Send the information to all client
                    // socket io docs emit-cheatsheet
                    this.sendGameSubject(planif_ref,data.subject);
                });

                socket.on('change_results_visibility', (data) => {
                    debug("%s choose result visibility to %s", socket.id, data.choosenVisibility);
                    this.planifRooms.get(this.getRoomName(planif_ref)).resultsVisibility = data.choosenVisibility;
                    this.sendVisibilityChanged(planif_ref, data.choosenVisibility)
                });

                socket.on('change_type_game', (data) => {
                    debug("%s change type game to %s", socket.id, data.choosenGameType);
                    let room = this.planifRooms.get(this.getRoomName(planif_ref));
                    room.choosenGameType = data.choosenGameType;
                    this.sendGameTypeChanged(planif_ref, data.choosenGameType);
                    if (room.players !== undefined) {
                      for (let entry of room.players.entries()) {
                        entry[1].vote = null;
                        this.sendPlayerRestart(planif_ref, entry[1].ref,entry[1].socked_id)
                      }
                    }
                });

                socket.on('change_card_visibility', (data) => {
                    debug("%s choose card %s visibility to %s", socket.id, data.cardIndex, data.choosenVisibility);

                    let room = this.planifRooms.get(this.getRoomName(planif_ref));
                    let roomCards = room.cardsGames.get(room.choosenGameType);
                    if (data.cardIndex>=0 && data.cardIndex<roomCards.length) {
                        roomCards[data.cardIndex].active = data.choosenVisibility;
                        this.sendCardVisibilityChanged(planif_ref, data.cardIndex, data.choosenVisibility);
                    }
                });
            }
        });
    },
    getRoomName: function (planif_ref) {
        return "planif_" + planif_ref;
    },
    getClassicCard: function () {
        return [
            {value:"0", active: true},{value:"1/2", active: true},{value:"1", active: true},
            {value:"2", active: true},{value:"3", active: true},{value:"5", active: true},
            {value:"8", active: true},{value:"13", active: true},{value:"20", active: true},
            {value:"40", active: true},{value:"100", active: true},{value:"&#xf128", active: true},
            {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
        ]
    },
    getTShirtCard: function () {
        return [
            {value:"XS", active: true},{value:"S", active: true},{value:"M", active: true},
            {value:"L", active: true},{value:"XL", active: true},{value:"&#xf128", active: true},
            {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
        ]
    },
    getScrumLifeCard: function () {
        return [
            {value:"1", active: true},{value:">1", active: true},
            {value:"&#xf128", active: true},{value:"&#xf0f4;", active: true}
        ]
    },

    ///////
    // list of "messages" which can be emit by the server to the clients

    sendAuthenticationError: function (socket) {
        debug('sendAuthenticationError to %s:', socket.id);
        // https://socket.io/docs/v4/emit-cheatsheet/
        // sending to the client
        socket.emit("authentication_error", null);
    },

    sendUserJoinPlanif: function(planif_ref, participant) {
        debug('sendUserJoinPlanif to planif %s : %s', planif_ref, participant.ref);
        this.app.io.to(this.getRoomName(planif_ref)).emit('user_join_planif', { user: participant });
    },

    sendUserLeavePlanif: function(planif_ref, participant_ref) {
        debug('sendUserLeavePlanif to planif %s : %s', planif_ref, participant_ref);
        this.app.io.to(this.getRoomName(planif_ref)).emit('user_leave_planif', { user_ref: participant_ref });
    },

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
    sendPlayerRestart: function(planif_ref, player_ref, socket_id) {
        debug('sendPlayerRestart player %s for planif %s to %s', player_ref, planif_ref, socket_id);
        // sending to individual socketid (private message)
        this.app.io.to(socket_id).emit("restart_choose");
    },
    sendPlanifName: function (planif_ref, name) {
        debug('sendPlanifName to planif:' + planif_ref + " " + name);
        this.app.io.to(this.getRoomName(planif_ref)).emit('planif_name', {name: name});
    },
    sendGameSubject: function (planif_ref, subject) {
        debug('sendGameSubject to planif:' + planif_ref + " " + subject);
        this.app.io.to(this.getRoomName(planif_ref)).emit('game_subject', {subject: subject});
    },
    sendVisibilityChanged: function(planif_ref, choosenValue) {
        debug('sendVisibilityChanged to planif %s : %s', planif_ref, choosenValue);
        this.app.io.to(this.getRoomName(planif_ref)).emit('results_visibility_changed', { choosenVisibility: choosenValue});
    },
    sendCardVisibilityChanged: function(planif_ref, cardIndex, choosenValue) {
        debug('sendCardVisibilityChanged to planif %s : %s, %s', planif_ref, cardIndex, choosenValue);
        this.app.io.to(this.getRoomName(planif_ref)).emit('card_visibility_changed', {cardIndex: cardIndex, choosenVisibility: choosenValue});
    },
    sendGameTypeChanged: function(planif_ref, cardsGameName) {
        debug('sendGameTypeChanged to planif %s', planif_ref);
        this.app.io.to(this.getRoomName(planif_ref)).emit('game_type_changed', { cardsGameName: cardsGameName});
    },
}
