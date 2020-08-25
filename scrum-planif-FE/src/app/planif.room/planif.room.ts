import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { Player } from '../auth.service/player';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
      return this.getMessages('players_' + this.planif_ref);
    }

    // TODO : Listen only once
    public askPlayers() {
      console.log('ask_players');
      var obs = this.listenPlayers();
      this.sendOnlyAMessage("ask_players");
      return obs;
    }
}
