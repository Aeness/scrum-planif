import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import Debug from "debug";
const debug = Debug("scrum-planif:clientIo");

@Injectable()
export class IoWebsocketMockService {

  //private nameRoom: string;
  public subjects = new Map<string,Subject<any>>();

  constructor() { }

  public connect(nameRoom : string, onConnect? : () => void) {
    //this.nameRoom = nameRoom;
    onConnect();
  }

  public getMessages = (message: string) : Observable<any> => {
    // Necessary ?
    if (!this.subjects.has(message)) {
      if ("results_visibility_changed") {
        let bs : Subject<{choosenVisibility : boolean}> = new Subject();
        this.subjects.set(message, bs);
      } else {
        console.error(message + "not mocked")
        let bs : Subject<any> = new Subject();
        this.subjects.set(message, bs);
      }
    }
    return this.subjects.get(message);
    //return new Observable<any>((observer) => { });
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
          cards:  [
            {value:"0", active: true},{value:"1/2", active: true},{value:"1", active: true},
            {value:"2", active: true},{value:"3", active: true},{value:"5", active: true},
            {value:"8", active: true},{value:"13", active: true},{value:"20", active: true},
            {value:"40", active: true},{value:"100", active: true},{value:"?", active: true},
            {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
          ],
          players : [{ ref: "ref", name: "Toto", vote: null}],
          resultsVisibility: false
      })
    } else {
      console.error(message + "not mocked")
      action(null, null);
    }
  }
}
