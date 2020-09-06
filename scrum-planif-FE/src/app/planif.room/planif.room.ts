import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { Player } from '../auth.service/player';

export class PlanifRoom extends IoWebsocketService {

  /**
   * Must be use only once.
   * Each main component must have is own PlanifRoom.
   * (Provider on the component)
   *
   * @param planif_ref
   */
  public init(planif_ref : String) {
    // TODO : you can connect without init (lost connexion with server)
    // you have to re ask to join when happen
    super.connect("planif=" + planif_ref);
  }

  public listenPlayerJoinPlanif() {
      return this.getMessages('player_join_planif');
  }


  // TODO if connexion close delete the players list


  public sendJoinThePlanif(data: Player) : Promise<Map<String, Player>> {
    return new Promise<Map<String, Player>>((resolve, reject) => {
        if (!this.socket) {
            reject('No socket connection.');
        } else {
            this.socket.emit("ask_to_join_planif", data, (error, response : Map<String, Player>) => {
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
