import { Injectable, OnDestroy } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import Debug from "debug";
import { TokenTool } from '../auth.service/token.tool';
import { AuthService } from '../auth.service/auth.service';
import { JwtTokens } from '../auth.service/jwtTokens';
import { StorageTokenTool } from '../auth.service/storage-token.tool';
const debug = Debug("scrum-planif:clientIo");

@Injectable()
export class IoWebsocketService implements OnDestroy {

  protected socket; // Socket -  SocketIOClient.Socket
  protected nameRoom: String

  constructor(private authService: AuthService) { }

  protected connect(nameRoom : String, onConnect? : () => void) {
    if (!this.socket) {
      this.nameRoom = nameRoom

      let token = StorageTokenTool.token();
      if (!TokenTool.tokenIsOk(token)) {
        return this.authService.refresh(StorageTokenTool.refeshToken()).subscribe(
          (tokens: JwtTokens) => {
            StorageTokenTool.saveTokens(tokens.token, tokens.refreshToken);
            this._connect(tokens.token, onConnect)
          }
        )
      } else {
        this._connect(token, onConnect)
      }
    }
  }

  // The token must be OK
  private _connect(token : string, onConnect? : () => void) {
    var url = environment.restAndIoBackEndUrl + '?' + this.nameRoom + "&jwt=" + token;

    // TODO : https://socket.io/docs/v3/client-initialization/#auth
    this.socket = io(url);

    // localStorage.debug='socket.io-client:*,scrum-planif:clientIo'
    debug("#[Io]# Try to connected: " + url);

    // Socket event
    this.socket.on('connect_error', (err : Error) => {
      debug('#[Io:socket]# Connection Error (%s) in %s', err.message, this.nameRoom);
      window.location.reload();
    });
    this.socket.on('connect',  () => {
      debug('#[Io:socket]# Connected ' + this.nameRoom + ' with id:' + this.socket.id);
      debug('#[Io:socket]# transport ' + this.socket.io.engine.transport.name);
      if (onConnect !== undefined) {
        onConnect();
      }
    });
    this.socket.on('disconnect',  (reason) => {
      // When quite the page, call before this.socket.io.on("close"
      debug('#[Io:socket]# Disconnected ' + this.nameRoom + ' ' + reason);
    });

    // Manager event : open, error, close, ping, packet, reconnect_attempt, reconnect, reconnect_error, reconnect_failed
    this.socket.io.on("open", () => {
      debug('#[Io:Manager]# open ' + this.nameRoom);
    });
    this.socket.io.on("close", (reason) => {
      debug('#[Io:Manager]# close ' + this.nameRoom + ' ' + reason);
    });

    // this.socket.io: Manager
    this.socket.io.engine.on('upgrade', function(transport) {
      debug('#[Io]# transport changed to ' + transport.name);
    });
  }

  protected getMessages = (message: string) => {
    return new Observable<any>((observer) => {
        this.socket.on(message, (data) => {
          observer.next(data);
        });
    });
  }


  protected sendOnlyAMessage(message: string) {
    this.socket.emit(message);
  }

  protected sendMessage(message: string, data: any) {


    let token = StorageTokenTool.token();
    if (!TokenTool.tokenIsOk(token)) {
      debug('tokenIsOk is NOT OK');
      return this.authService.refresh(StorageTokenTool.refeshToken()).subscribe(
        (tokens: JwtTokens) => {
          StorageTokenTool.saveTokens(tokens.token, tokens.refreshToken);
          data.jwt = tokens.token;
          this.socket.emit(message, data);
        }
      )
    } else {
      data.jwt = token;
      this.socket.emit(message, data);
    }
  }

  ngOnDestroy() {
    // We can because each IoWebsocketService have is own Soket :
    // All IoWebsocketService use the same namespace
    // and with io.socket reusing the same namespace will also create two connections/Manager/Socket
    // https://socket.io/docs/client-api/#With-multiplexing
    // This call also destroy the Socket and close and destroy the Manager

    // The socket can be undefinited if we destroy the component before call
    // init

    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
