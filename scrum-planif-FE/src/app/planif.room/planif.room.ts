import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { Player } from '../auth.service/player';
import { Observable } from 'rxjs';

export class PlanifRoom extends IoWebsocketService {

  /**
   * Each MAIN component must have is own PlanifRoom.
   * (Provider on the component)
   *
   * But sub component must have the same PlanifRoom than the main component.
   *
   * @param planif_ref
   * @param data
   * @param onConnect
   */
  public init(planif_ref : String, data: Player, onConnect : () => void) {
    super.connect("planif=" + planif_ref, "player", data, onConnect);
  }

  public askToPlay() {
    this.socket.emit("join_planif");
  }

  public askToNotPlay() {
    this.socket.emit("leave_planif");
  }

  public listenPlayerJoinPlanif() : Observable<{player: Player}> {
      return this.getMessages('player_join_planif');
  }

  public listenPlayerQuitPlanif() : Observable<{player_ref: String}> {
      return this.getMessages('player_leave_planif');
  }

  public askPlayersList() : Promise<Map<String, Player>> {
    return new Promise<Map<String, Player>>((resolve, reject) => {
        if (!this.socket) {
            reject('No socket connection.');
        } else {
            this.socket.emit("ask_players_list", (error, response : any) => {
                if (error) {
                  console.error(error);
                  reject(error);
                } else {
                  // Object to Map
                  let resMap = new Map<String, Player>()
                  let entry : [string, any];
                  for ( entry of Object.entries(response)) {
                    resMap.set(entry[0],entry[1])
                  }
                  resolve(resMap);
                }
            });
        }
    });
  }

  public listenPlanifChoise() : Observable<{player_ref: String, choosenValue : String}> {
      return this.getMessages('player_choose');
  }

  public sendPlanifChoise(choosenValue : String) {
    this.socket.emit("player_choose", {choosenValue : choosenValue});
  }
}
