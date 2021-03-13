import { Injectable, OnDestroy } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import Debug from "debug";
import { TokenTool } from '../auth.service/token.tool';
import { AuthService } from '../auth.service/auth.service';
import { JwtTokens } from '../auth.service/jwtTokens';
const debug = Debug("scrum-planif:clientIo");

@Injectable()
export class IoWebsocketMockService {

  private nameRoom: String;

  constructor(private authService: AuthService) { }

  public connect(nameRoom : String, onConnect? : () => void) {
    this.nameRoom = nameRoom;
    onConnect();
  }

  public getMessages = (message: string) => {
    return new Observable<any>((observer) => { });
  }

  public sendOnlyAMessage(message: string) { }

  public sendMessage(message: string, data: any) { }

  public sendAction(message: string, action: (error, response : any) => void) {
    console.error("sendAction:" + message)
    if( message == "ask_planif_informations") {
      action(
        null,
        {
          name: "name",
          subject: "",
          cards:  [
            {value:"0", active: true},{value:"1/2", active: true},{value:"1", active: true},
            {value:"2", active: true},{value:"3", active: true},{value:"5", active: true},
            {value:"8", active: true},{value:"13", active: true},{value:"20", active: true},
            {value:"40", active: true},{value:"100", active: true},{value:"?", active: true},
            {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
          ],
          players : [{ ref: "ref", name: "Toto", vote: null}],
          resultsVisibility: true
      })
    } else {
      console.error(message + "not mocked")
      action(null, null);
    }
  }
}
