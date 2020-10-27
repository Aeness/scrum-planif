import { Injectable, OnDestroy } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import Debug from "debug";
const debug = Debug("scrum-planif:clientIo");

@Injectable()
export class IoWebsocketService implements OnDestroy {

  protected socket; // Socket -  SocketIOClient.Socket
  protected nameRoom: String

  constructor() { }

  protected connect(nameRoom : String, jsonName? : String, jsonData? : any, onConnect? : () => void) {
    if (!this.socket) {
      this.nameRoom = nameRoom
      var url = environment.restAndIoBackEndUrl + '?' + this.nameRoom;


      if (jsonName !== undefined && jsonData !== undefined) {
        url = url + "&" + jsonName + "=" + JSON.stringify(jsonData);
      }

      this.socket = io(url);

      debug("#[Io]# Try to connected: " + url);

      // Global events are bound against socket
      this.socket.on('connect_failed', () => {
        debug('#[Io]# Connection Failed ' + this.nameRoom);
      });
      this.socket.on('connect',  () => {
        debug('#[Io]# Connected ' + this.nameRoom + ' with id:' + this.socket.id);
        debug('#[Io]# transport ' + this.socket.io.engine.transport.name);
        if (onConnect !== undefined) {
          onConnect();
        }
      });
      this.socket.on('disconnect',  (reason) => {
        debug('#[Io]# Disconnected ' + this.nameRoom + ' ' + reason);
      });

      // this.socket.io: Manager
      this.socket.io.engine.on('upgrade', function(transport) {
        debug('#[Io]# transport changed to ' + transport.name);
      });

    }
  }

  protected getMessages = (message: string) => {
    return Observable.create((observer) => {
        this.socket.on(message, (data) => {
          observer.next(data);
        });
    });
  }


  protected sendOnlyAMessage(message: string) {
    this.socket.emit(message);
  }

  protected sendMessage(message: string, data: any) {
      this.socket.emit(message, data);
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
