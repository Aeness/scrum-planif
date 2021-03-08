import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { Player } from './player';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class PlanifRoom {
  // Send the last name knew by the room.
  public name$ : BehaviorSubject<String> = new BehaviorSubject("");
  public subject$ : BehaviorSubject<String> = new BehaviorSubject("");
  public playersList$ : BehaviorSubject<Map<String, Player>> = new BehaviorSubject(new Map<String, Player>());
  public resultsVisibility$ : BehaviorSubject<Boolean> = new BehaviorSubject(true);
  public cardsList$ : BehaviorSubject<Array<{value: string, active: boolean}>> = new BehaviorSubject<Array<{value: string, active: boolean}>>([]);


  constructor(private ioWebsocketService: IoWebsocketService) { }

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
    public init(planif_ref : string, onChildrenConnect : () => void) {
      this.ioWebsocketService.connect("planif=" + planif_ref, () => {
      // Call when the server restart
      this.ioWebsocketService.socket.emit("ask_planif_informations", (error, response : any) => {
        if (error) {
          console.error(error);
        } else {
          this.name$.next(response.name);
          this.subject$.next(response.subject);
          this.cardsList$.next(response.cards);

          // Object to Map
          let entry : [string, any];
          for (entry of Object.entries(response.players)) {
            this.playersList$.value.set(entry[0],entry[1]);
          }

          this.listenAuthenticationError();

          this.listenPlanifName().subscribe(
            (data) => {
              this.name$.next(data.name);
            }
          );

          this.listenGameSubject().subscribe(
            (data) => {
              this.subject$.next(data.subject);
            }
          );

          this.listenPlayerJoinPlanif().subscribe(
            (dataJoin: { player: Player; }) => {
              this.playersList$.value.set(dataJoin.player.ref, dataJoin.player);
            }
          );

          this.listenPlayerQuitPlanif().subscribe(
            (dataQuit: { player_ref: String; }) => {
              this.playersList$.value.delete(dataQuit.player_ref);
            }
          );

          this.listenPlanifChoise().subscribe(
            (dataChoise: {player_ref: String, choosenValue : String}) => {
              //this.votes.get(dataChoise.player_ref).vote = dataChoise.choosenValue;
              this.playersList$.value.get(dataChoise.player_ref).vote = dataChoise.choosenValue;
            }
          );

          this.resultsVisibility$.next(response.resultsVisibility);

          this.listenResultsVisibility().subscribe(
            (dataChoise: {choosenVisibility : Boolean}) => {
              this.resultsVisibility$.next(dataChoise.choosenVisibility);
            }
          );

          this.listenCardVisibility().subscribe(
            (data : {cardIndex: number, choosenVisibility : boolean}) => {
              this.cardsList$.value[data.cardIndex].active = data.choosenVisibility;
            }
          );
          // TODO use AsyncSubject<boolean> ???
          onChildrenConnect();
        }
      });
    });
  }

  private listenAuthenticationError() {
    this.ioWebsocketService.getMessages('authentication_error').subscribe(
        () => {
          // TODO Display a message in a toast
          window.location.reload();
        }
      )
  }

  // TODO rename without ask
  public askToPlay() {
    this.ioWebsocketService.socket.emit("join_planif");
  }
  // TODO rename without ask
  public askToNotPlay() {
    this.ioWebsocketService.socket.emit("leave_planif");
  }

  private listenPlayerJoinPlanif() : Observable<{player: Player}> {
      return this.ioWebsocketService.getMessages('player_join_planif');
  }

  private listenPlayerQuitPlanif() : Observable<{player_ref: String}> {
      return this.ioWebsocketService.getMessages('player_leave_planif');
  }

  public sendPlanifChoise(choosenValue : String) {
    this.ioWebsocketService.sendMessage("player_choose", {choosenValue : choosenValue});
  }

  private listenPlanifChoise() : Observable<{player_ref: String, choosenValue : String}> {
      return this.ioWebsocketService.getMessages('player_choose');
  }

  public listenRestartMyChoise() : Observable<any> {
      return this.ioWebsocketService.getMessages('restart_choose');
  }

  public sendPlanifName(name: string) {
    this.ioWebsocketService.sendMessage("send_planif_name", name);
  }

  private listenPlanifName() : Observable<{name: string}> {
    return this.ioWebsocketService.getMessages('planif_name');
  }

  public sendGameSubject(subject: string) {
    this.ioWebsocketService.sendMessage("send_game_subject", {"subject": subject});
  }

  private listenGameSubject() : Observable<{subject: String}> {
    return this.ioWebsocketService.getMessages('game_subject');
  }

  public sendResultsVisibility(choosenValue : Boolean) {
    this.ioWebsocketService.sendMessage("change_results_visibility", {choosenVisibility : choosenValue});
  }

  private listenResultsVisibility() : Observable<{choosenVisibility : Boolean}> {
      return this.ioWebsocketService.getMessages('results_visibility_changed');
  }

  public sendRestartGameSubject(subject: string) {
    this.ioWebsocketService.sendMessage("send_game_subject", {"subject": subject});
    this.ioWebsocketService.sendMessage("change_results_visibility", {choosenVisibility : false});
    this.ioWebsocketService.socket.emit("restart_choose");
  }

  public sendCardVisibility(cardIndex: number, choosenVisibility : boolean) {
    this.ioWebsocketService.sendMessage("change_card_visibility", {cardIndex: cardIndex, choosenVisibility : choosenVisibility});
  }

  public listenCardVisibility() : Observable<{cardIndex : number, choosenVisibility : boolean}> {
      return this.ioWebsocketService.getMessages('card_visibility_changed');
  }
}
