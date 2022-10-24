import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import Debug from "debug";
import { Player } from '../planif.room/player';
import { User } from '../planif.room/user';
const debug = Debug("scrum-planif:clientIo");

@Injectable()
export class IoWebsocketMockService {

  public curentUsers : {} = {};
  public me : User;
  public curentPlayers : {} = {};
  public subjects = new Map<string,Subject<any>>();

  constructor() {
    this.subjects.set("results_visibility_changed", new Subject<{choosenVisibility : boolean}>());
    this.subjects.set("card_visibility_changed", new Subject<{cardIndex: number, choosenVisibility: boolean}>());
    this.subjects.set("game_type_changed", new Subject<{cardsGameName: string}>());
    this.subjects.set("game_added_and_selected", new Subject<{cardsGameName : string, cardsGame : Array<any>}>());
    this.subjects.set("authentication_error", new Subject());
    this.subjects.set("planif_name", new Subject<{name: string}>());
    this.subjects.set("game_subject", new Subject<{subject: string}>());
    this.subjects.set("user_join_planif", new Subject<{user: User}>());
    this.subjects.set("user_leave_planif", new Subject<{user_ref: string}>());
    this.subjects.set("player_join_planif", new Subject<{player: Player}>());
    this.subjects.set("player_leave_planif", new Subject<{player_ref: string}>());
    this.subjects.set("player_choose", new Subject<{ player_ref: string, choosenValue: string}>());
    this.subjects.set("restart_choose", new Subject());
  }

  public connect(nameRoom : string, onConnect? : () => void) {
    onConnect();
  }

  public getMessages = (message: string) : Observable<any> => {
    if (this.subjects.has(message)) {
      return this.subjects.get(message);
    } else {
      console.error(message + " not mocked")
      throw message + " not mocked"
    }

  }

  public sendOnlyAMessage(message: string) { }

  public sendMessage(message: string, data: any) { }

  public sendAction(message: string, action: (error, response : any) => void) {
    if( message == "ask_planif_informations") {
      action(
        null,
        {
          name: "name",
          subject: "",
          choosenGameType: "classic",
          cardsGame:  {
            classic : [
              {value:"0", active: true},{value:"1/2", active: true},{value:"1", active: true},
              {value:"2", active: true},{value:"3", active: true},{value:"5", active: true},
              {value:"8", active: true},{value:"13", active: true},{value:"20", active: true},
              {value:"40", active: true},{value:"100", active: true},{value:"&#xf128", active: true},
              {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
            ],
            TS : [
              {value:"XS", active: true},{value:"S", active: true},{value:"M", active: true},
              {value:"L", active: true},{value:"XL", active: true},{value:"&#xf128", active: true},
              {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
            ],
            ScrumLife : [
              {value:"1", active: true},{value:">1", active: true},
              {value:"&#xf128", active: true},{value:"&#xf0f4;", active: true}
            ]
          },
          users : this.curentUsers,
          players :  this.curentPlayers,
          resultsVisibility: false,
          me : this.me
      })
    } else {
      console.error(message + "not mocked")
      action(null, null);
    }
  }

  public initMe(me : User) {
    this.curentUsers[me.ref] = me;
    this.me = me;
  }
}
