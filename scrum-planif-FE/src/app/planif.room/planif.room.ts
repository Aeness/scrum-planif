import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { Player } from './player';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { User } from './user';

@Injectable()
export class PlanifRoom implements OnDestroy {
  private unsubscribe$ = new Subject();

  // Data from server
  public name$ : BehaviorSubject<string> = new BehaviorSubject("");
  public subject$ : BehaviorSubject<string> = new BehaviorSubject("");
  public usersList$ : BehaviorSubject<Map<string, User>> = new BehaviorSubject(new Map<string, User>());
  public playersList$ : BehaviorSubject<Map<string, Player>> = new BehaviorSubject(new Map<string, Player>());
  public resultsVisibility$ : BehaviorSubject<boolean> = new BehaviorSubject(true);
  public allCardsList$ : BehaviorSubject<Map<string, Array<{value: string, active: boolean}>>> = new BehaviorSubject(new Map<string, Array<{value: string, active: boolean}>>());
  public currentCardsList$ : BehaviorSubject<Array<{value: string, active: boolean}>> = new BehaviorSubject<Array<{value: string, active: boolean}>>([]);
  public currentGameName$ : BehaviorSubject<string> = new BehaviorSubject<string>("");
  public currentGameName : string = "";

  // Observable
  private restartMyChoiseEvent$ : Observable<any>;
  private cardVisibilityEvent$ : Observable<{gameName : string, cardIndex : number, choosenVisibility : boolean}>;


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
    public init(planif_ref : string, admin : boolean, onChildrenConnect : () => void) {
      this.ioWebsocketService.connect("planif=" + planif_ref + "&admin=" + admin, () => {
      // Call when the server restart
      this.ioWebsocketService.sendAction("ask_planif_informations", (error, response : any) => {
        if (error) {
          console.error(error);
        } else {
          this.name$.next(response.name);
          this.subject$.next(response.subject);

          // Object to Map
          let entryUser : [string, any];
          for (entryUser of Object.entries(response.users)) {
            this.usersList$.value.set(entryUser[0],entryUser[1]);
          }

          // Object to Map
          let entryPlayer : [string, any];
          for (entryPlayer of Object.entries(response.players)) {
            this.playersList$.value.set(entryPlayer[0],entryPlayer[1]);
          }

          // Object to Map
          let entry : [string, any];
          let allCardsList: Map<string, Array<{value: string, active: boolean}>> = new Map<string, Array<{value: string, active: boolean}>>();
          for (entry of Object.entries(response.cardsGame)) {
            allCardsList.set(entry[0],entry[1]);
          }
          this.allCardsList$.next(allCardsList);
          this.currentCardsList$.next(allCardsList.get(response.choosenGameType));
          this.currentGameName$.next(response.choosenGameType);
          this.currentGameName = response.choosenGameType;

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

          this.listenUserJoinPlanif().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (dataQuit: { user: User }) => {
              this.usersList$.value.set(dataQuit.user.ref, dataQuit.user);
            }
          );

          this.listenParticipantQuitPlanif().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (dataQuit: { user_ref: string; }) => {
              this.playersList$.value.delete(dataQuit.user_ref);
              this.usersList$.value.delete(dataQuit.user_ref);
            }
          );

          this.listenPlayerJoinPlanif().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (dataJoin: { player: Player; }) => {
              this.playersList$.value.set(dataJoin.player.ref, dataJoin.player);
              this.usersList$.value.get(dataJoin.player.ref).role.isPlaying = true;
            }
          );

          this.listenPlayerQuitPlanif().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (dataQuit: { player_ref: string; }) => {
              this.playersList$.value.delete(dataQuit.player_ref);
              this.usersList$.value.get(dataQuit.player_ref).role.isPlaying = false;
            }
          );

          this.listenPlanifChoise().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (dataChoise: {player_ref: string, choosenValue : string}) => {
              //this.votes.get(dataChoise.player_ref).vote = dataChoise.choosenValue;
              if (this.playersList$.value.has(dataChoise.player_ref)) {
                this.playersList$.value.get(dataChoise.player_ref).vote = dataChoise.choosenValue;
              }
              if (this.usersList$.value.has(dataChoise.player_ref)) {
                this.usersList$.value.get(dataChoise.player_ref).vote = dataChoise.choosenValue;
              }
            }
          );

          this.resultsVisibility$.next(response.resultsVisibility);

          this.listenResultsVisibility().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (dataChoise: {choosenVisibility : boolean}) => {
              this.resultsVisibility$.next(dataChoise.choosenVisibility);
            }
          );

          this.listenCardVisibility().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (data : {cardIndex: number, choosenVisibility : boolean}) => {
              this.currentCardsList$.value[data.cardIndex].active = data.choosenVisibility;
            }
          );

          this.listenGameType().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (response: {cardsGameName : string}) => {
              // TODO : put this two informations together
              this.currentCardsList$.next(this.allCardsList$.value.get(response.cardsGameName));
              this.currentGameName$.next(response.cardsGameName);
              this.currentGameName = response.cardsGameName;
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

  private listenUserJoinPlanif() : Observable<{user: User}> {
      return this.ioWebsocketService.getMessages('user_join_planif');
  }

  private listenParticipantQuitPlanif() : Observable<{user_ref: string}> {
      return this.ioWebsocketService.getMessages('user_leave_planif');
  }

  // TODO rename without ask
  public askToPlay() {
    this.ioWebsocketService.sendOnlyAMessage("join_planif");
  }
  // TODO rename without ask
  public askToNotPlay() {
    this.ioWebsocketService.sendOnlyAMessage("leave_planif");
  }

  private listenPlayerJoinPlanif() : Observable<{player: Player}> {
      return this.ioWebsocketService.getMessages('player_join_planif');
  }

  private listenPlayerQuitPlanif() : Observable<{player_ref: string}> {
      return this.ioWebsocketService.getMessages('player_leave_planif');
  }

  public sendPlanifChoise(choosenValue : string) {
    this.ioWebsocketService.sendMessage("player_choose", {choosenValue : choosenValue});
  }

  private listenPlanifChoise() : Observable<{player_ref: string, choosenValue : string}> {
      return this.ioWebsocketService.getMessages('player_choose');
  }

  public listenRestartMyChoise() : Observable<any> {
    if (this.restartMyChoiseEvent$ == undefined) {
      this.restartMyChoiseEvent$ = this.ioWebsocketService.getMessages('restart_choose');
    }
    return this.restartMyChoiseEvent$;
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

  private listenGameSubject() : Observable<{subject: string}> {
    return this.ioWebsocketService.getMessages('game_subject');
  }

  public sendResultsVisibility(choosenValue : boolean) {
    this.ioWebsocketService.sendMessage("change_results_visibility", {choosenVisibility : choosenValue});
  }

  private listenResultsVisibility() : Observable<{choosenVisibility : boolean}> {
      return this.ioWebsocketService.getMessages('results_visibility_changed');
  }

  public sendTypeGame(gameName : string) {
    this.ioWebsocketService.sendMessage("change_type_game", {choosenGameType : gameName});
  }

  private listenGameType() : Observable<{cardsGameName : string}> {
      return this.ioWebsocketService.getMessages('game_type_changed');
  }

  public sendRestartGameSubject(subject: string) {
    this.ioWebsocketService.sendMessage("send_game_subject", {"subject": subject});
    this.ioWebsocketService.sendMessage("change_results_visibility", {choosenVisibility : false});
    this.ioWebsocketService.sendOnlyAMessage("restart_choose");
  }

  public sendCardVisibility(cardIndex: number, choosenVisibility : boolean) {
    this.ioWebsocketService.sendMessage("change_card_visibility", {cardIndex: cardIndex, choosenVisibility : choosenVisibility});
  }

  public listenCardVisibility() : Observable<{cardIndex : number, choosenVisibility : boolean}> {
    if (this.cardVisibilityEvent$ == undefined) {
      this.cardVisibilityEvent$ = this.ioWebsocketService.getMessages('card_visibility_changed');
    }
    return this.cardVisibilityEvent$;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
