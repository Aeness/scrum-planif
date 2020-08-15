import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtTokens }    from './jwtTokens';
import { environment } from '../../environments/environment';
import { StorageTokenTool } from './storage-token.tool';
import { Observable, Subject } from 'rxjs';
import { Payload } from './payload';
import { Player } from './player';

@Injectable()
export class AuthService {

  restServiceUrl: string;

  constructor(private http: HttpClient) {
    this.restServiceUrl = environment.restAndIoBackEndUrl  + '/auth';
  }

  start(name:string): Observable<JwtTokens> {
    return this.http.post<JwtTokens>(this.restServiceUrl, {player: {name: name}});
  }

  // TODO use shareReplay
  refresh(refreshToken:string): Observable<JwtTokens> {
    return this.http.post<JwtTokens>(
      this.restServiceUrl + '/refresh', {},
      {headers:{"Authorization": "Bearer " + refreshToken}}
    );
    // this is just the HTTP call,
    // we still need to handle the reception of the token
    //.shareReplay();
  }

  private playerConnectedSource = new Subject<Player>();

  get hasPlayerConnected() : boolean {
    return StorageTokenTool.hasToken();
  }

  get playerConnected() : Player {
    let token_decoded : Payload = StorageTokenTool.decodedToken();
    return {ref: token_decoded.ref, name: token_decoded.name};
  }

  // Observable player streams
  playerAnnounced$ = this.playerConnectedSource.asObservable();

  // Service message commands
  announcePlayer(token_decoded: Payload) {
    this.playerConnectedSource.next({ref: token_decoded.ref, name: token_decoded.name});
  }

  revokePlayer() {
    this.playerConnectedSource.next(null);
  }

}
