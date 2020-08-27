import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { Player } from '../auth.service/player';

export class PlanifRoom extends IoWebsocketService {
  private planif_ref: String;

    /**
     * Must be use only once.
     * Each component must have is own PlanifRoom.
     * (Provider on the component)
     *
     * @param planif_ref
     */
    public init(planif_ref : String) {
      // TODO : you can connect without init (lost connexion with server)
      // you have re ask to join when happen
      this.planif_ref = planif_ref;
      super.connect("planif=" + planif_ref);
    }

    public listenPlayerJoinPlanif() {
        return this.getMessages('player_join_planif');
    }


    // TODO if connexion close delete the players list


    public sendJoinThePlanif(data: Player) {
      this.sendMessage("ask_to_join_planif", data);
    }

    private listenPlayers() {
      return this.getMessages('players');
    }

    // TODO : Listen only once
    public askPlayers() {
      console.log('ask_players');
      var obs = this.listenPlayers();
      this.sendOnlyAMessage("ask_players");
      return obs;
    }
}
