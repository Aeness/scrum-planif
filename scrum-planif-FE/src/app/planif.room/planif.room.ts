import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { Player } from '../auth.service/player';
import { AsyncSubject, Observable } from 'rxjs';
import { Planif } from './planif';
import { Injectable } from '@angular/core';

@Injectable()
export class PlanifRoom extends IoWebsocketService {
  public planif$ : AsyncSubject<Planif> = new AsyncSubject()

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
  public init2(planif_ref : String, data: Player) {
    super.connect("planif=" + planif_ref, "player", data, () => {
      this.askPlanifRoom().then(
        (data: Planif) => {
          this.planif$.next(data);
          this.planif$.complete();
        }
      )
    });
    return this.planif$;
  }

  private askPlanifRoom() : Promise<Planif> {
    return new Promise<Planif>((resolve, reject) => {
      if (!this.socket) {
          reject('No socket connection.');
      } else {
        this.socket.emit("ask_planif_informations", (error, response : any) => {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              var reponseTS : Planif  = new Planif();
              reponseTS.ref = response.ref;
              reponseTS.name = response.name;
              /*
              // Object to Map
              let resPlayersMap = new Map<String, Player>()
              let entry : [string, any];
              for ( entry of Object.entries(response.players)) {
                resPlayersMap.set(entry[0],entry[1])
              }
              reponseTS.players = resPlayersMap;
              */
              resolve(reponseTS);
            }
        });
      }
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

  public sendPlanifName(name: String) {
    this.sendMessage("send_planif_name", name);
  }

  public listenPlanifName() : Observable<{name: String}> {
    return this.getMessages('planif_name');
  }
}
