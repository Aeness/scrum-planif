import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { Player } from '../auth.service/player';
import { Observable } from 'rxjs';

export class PlanifRoom extends IoWebsocketService {

  /**
   * Must be use only once.
   * Each main component must have is own PlanifRoom.
   * (Provider on the component)
   *
   * @param planif_ref
   */
  public init(planif_ref : String, data: Player, onConnect : () => void) {
    super.connect("planif=" + planif_ref, "player", data, onConnect);
  }

  public listenPlayerJoinPlanif() : Observable<{player: Player}> {
      return this.getMessages('player_join_planif');
  }

  public listenPlayerQuitPlanif() : Observable<{player_ref: String}> {
      return this.getMessages('player_quit_planif');
  }

  public askPlayersList() : Promise<Map<String, Player>> {
    return new Promise<Map<String, Player>>((resolve, reject) => {
        if (!this.socket) {
            reject('No socket connection.');
        } else {
            this.socket.emit("ask_players_list", (error, response : Map<String, Player>) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        }
    });
  }
}
