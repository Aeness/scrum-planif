import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { Player } from '../auth.service/player';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class PlanifRoom extends IoWebsocketService {
  // Send the last name knew by the room.
  public name$ : BehaviorSubject<String> = new BehaviorSubject("");
  public playersList$ : BehaviorSubject<Map<String, Player>> = new BehaviorSubject(new Map<String, Player>());

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
  public init(planif_ref : String, data: Player, onChildrenConnect : () => void) {
    super.connect("planif=" + planif_ref, "player", data, () => {

      this.socket.emit("ask_planif_informations", (error, response : any) => {
        if (error) {
          console.error(error);
        } else {
          this.name$.next(response.name);

          // Object to Map
          let entry : [string, any];
          for ( entry of Object.entries(response.players)) {
          this.playersList$.value.set(entry[0],entry[1]);
          }

          this.listenPlanifName().subscribe(
            (data) => {
              this.name$.next(data.name);
            }
          );

          this.listenPlayerJoinPlanif().subscribe(
            (dataJoin: { player: Player; }) => {
              this.playersList$.value.set(dataJoin.player.ref, dataJoin.player);
            }
          );

          // TODO use AsyncSubject<boolean> ???
          onChildrenConnect();
        }
      });
    });
  }

  // TODO rename without ask
  public askToPlay() {
    this.socket.emit("join_planif");
  }
  // TODO rename without ask
  public askToNotPlay() {
    this.socket.emit("leave_planif");
  }

  public listenPlayerJoinPlanif() : Observable<{player: Player}> {
      return this.getMessages('player_join_planif');
  }

  public listenPlayerQuitPlanif() : Observable<{player_ref: String}> {
      return this.getMessages('player_leave_planif');
  }

  public listenPlanifChoise() : Observable<{player_ref: String, choosenValue : String}> {
      return this.getMessages('player_choose');
  }

  public sendPlanifChoise(choosenValue : String) {
    this.socket.emit("player_choose", {choosenValue : choosenValue});
  }

  public sendPlanifName(name: String) {
    this.sendMessage("send_planif_name", name);
  }

  public listenPlanifName() : Observable<{name: String}> {
    return this.getMessages('planif_name');
  }
}
