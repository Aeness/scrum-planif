import { Injectable, OnDestroy } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import Debug from "debug";
import { TokenTool } from '../auth.service/token.tool';
import { AuthService } from '../auth.service/auth.service';
import { JwtTokens } from '../auth.service/jwtTokens';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Socket } from "socket.io-client";

const debug = Debug("scrum-planif:clientIo");

@Injectable()
export class IoWebsocketService implements OnDestroy {
  private unsubscribe$ = new Subject();

  private socket : Socket; // SocketIOClient.Socket
  private nameRoom: string;
  private activeInfoToast: ActiveToast<any> = null;
  private activeErrorToast: ActiveToast<any> = null;

  private pathname = window.location.pathname;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  // TODO nameRoom is not the nameRoom
  public connect(nameRoom : string, onConnect? : () => void) {
    if (!this.socket) {
      this.nameRoom = nameRoom

      let token = this.authService.userToken;
      if (!TokenTool.tokenIsOk(token)) {
        return this.authService.refresh(this.authService.userRefreshToken).subscribe(
          (tokens: JwtTokens) => {
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
    let url = environment.restAndIoBackEndUrl + '?' + this.nameRoom + "&jwt=" + token;

    // localStorage.debug='socket.io-client:*,scrum-planif:clientIo'
    debug("#[Io]# Initialize sockets for " + url);

    // TODO : https://socket.io/docs/v4/client-initialization/#auth
    this.socket = io(url);


    // this.socket.io: Manager
    // Manager event : open, error, close, ping, packet, reconnect_attempt, reconnect, reconnect_error, reconnect_failed

    // Manager event
    this.socket.io.on("reconnect_attempt", (attempt: number) => {
      debug('#[Io:Manager]# reconnect_attempt ' + this.nameRoom + ' with attempt:' + attempt);
      if (this.activeInfoToast == null && this.activeErrorToast == null) {

        this.activeInfoToast = this.toastr.info('Veuillez patienter.', 'Reconnection à Scrum Planif', {
          disableTimeOut: true
        });
        this.activeInfoToast
          .onTap
          .pipe(
            take(1),
            takeUntil(this.unsubscribe$))
          .subscribe(() => {
            this.activeInfoToast = null;
          });;
      }

    });

    // Socket event : could be on Manager event "reconnect_error"
    this.socket.on('connect_error', (err : any /*: Error*/) => {

      if (err.data !== undefined && err.data.auth) {

        if (this.activeInfoToast != null) {
          this.toastr.remove(this.activeInfoToast.toastId);
          this.activeInfoToast = null;
        }

        this.toastr.error('Veuillez vous reconnecter.', null, {
          disableTimeOut: false
        });
        this.authService.revokeUser();
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.pathname }});
      } else {

        debug('#[Io:socket]# Connection Error (%s) in %s', err.message, this.nameRoom);
        if (this.activeErrorToast == null) {

          if (this.activeInfoToast != null) {
            this.toastr.remove(this.activeInfoToast.toastId);
            this.activeInfoToast = null;
          }

          this.activeErrorToast = this.toastr.error('Veuillez patienter.', 'Impossible de joindre Scrum Planif', {
            disableTimeOut: true
          });
          this.activeErrorToast
            .onTap
            .pipe(
              take(1),
              takeUntil(this.unsubscribe$))
            .subscribe(() => {
              this.activeErrorToast = null;
            });;

        }
      }
    });

    // Socket event
    this.socket.on('connect',  () => {
      debug('#[Io:socket]# Connected ' + this.nameRoom + ' with id:' + this.socket.id);
      debug('#[Io:socket]# transport ' + this.socket.io.engine.transport.name);

      if (this.activeInfoToast != null) {
        this.toastr.remove(this.activeInfoToast.toastId);
        this.activeInfoToast = null;
      }

      if (this.activeErrorToast != null) {
        this.toastr.remove(this.activeErrorToast.toastId);
        this.activeErrorToast = null;
      }


      if (onConnect !== undefined) {
        onConnect();
      }
    });

    // Socket event
    this.socket.on('disconnect',  (reason) => {
      // When quite the page, call before this.socket.io.on("close"
      debug('#[Io:socket]# Disconnected ' + this.nameRoom + ' ' + reason);
    });

    // Manager events
    this.socket.io.on("open", () => {
      debug('#[Io:Manager]# open ' + this.nameRoom);
    });
    this.socket.io.on("close", (reason) => {
      debug('#[Io:Manager]# close ' + this.nameRoom + ' ' + reason);
    });

    this.socket.io.engine.on('upgrade', function(transport) {
      debug('#[Io]# transport changed to ' + transport.name);
    });

  }

  public getMessages = (message: string) => {
    return new Observable<any>((observer) => {
        this.socket.on(message, (data) => {
          observer.next(data);
        });
    });
  }

  public sendOnlyAMessage(message: string) {
    let token = this.authService.userToken;
    if (!TokenTool.tokenIsOk(token)) {
      debug('tokenIsOk is NOT OK');
      return this.authService.refresh(this.authService.userRefreshToken).subscribe(
        (tokens: JwtTokens) => {
          this.socket.emit(message, {jwt: tokens.token});
        }
      )
    } else {
      this.socket.emit(message, {jwt: token});
    }
  }

  public sendMessage(message: string, data: any) {
    let token = this.authService.userToken;
    if (!TokenTool.tokenIsOk(token)) {
      debug('tokenIsOk is NOT OK');
      return this.authService.refresh(this.authService.userRefreshToken).subscribe(
        (tokens: JwtTokens) => {
          data.jwt = tokens.token;
          this.socket.emit(message, data);
        },
        (err) => {
          if (err.status = 401) {
            this.toastr.error('Veuillez vous reconnecter.', 'Trop longue période sans activité.', {
              disableTimeOut: false
            });
            this.authService.revokeUser();
            // Don't use window.location.pathname at this time because if two messages are
            // sent at the same time, the 2nd will have /login as url
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.pathname }});
          } else {
            // TODO Display the error
            console.log('HTTP Error', err);
          }
        }
      )
    } else {
      data.jwt = token;
      this.socket.emit(message, data);
    }
  }

  public sendAction(message: string, action: (error, response : any) => void) {
    let token = this.authService.userToken;
    if (!TokenTool.tokenIsOk(token)) {
      debug('tokenIsOk is NOT OK');
      return this.authService.refresh(this.authService.userRefreshToken).subscribe(
        (tokens: JwtTokens) => {
          this.socket.emit(message, {jwt: tokens.token}, action);
        }
        // TODO Display a message in a toast
      )
    } else {
      this.socket.emit(message, {jwt: token}, action);
    }
  }

  ngOnDestroy() {
    // We can because each IoWebsocketService have is own Soket :
    // All IoWebsocketService use the same namespace
    // and with io.socket reusing the same namespace will also create two connections/Manager/Socket
    // https://socket.io/docs/v4/namespaces/ (see Client initialization)
    // This call also destroy the Socket and close and destroy the Manager

    // The socket can be undefinited if we destroy the component before call
    // init

    if (this.socket) {
      this.socket.disconnect();
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.activeErrorToast != null) {
      this.toastr.remove(this.activeErrorToast.toastId);
      this.activeErrorToast = null;
    }
  }
}
