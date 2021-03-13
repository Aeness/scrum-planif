import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtTokens }    from './jwtTokens';
import { environment } from '../../environments/environment';
import { StorageTokenTool } from './storage-token.tool';
import { Observable, Subject } from 'rxjs';
import { Payload } from './payload';
import { User } from './user';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthService {

  restServiceUrl: string;

  constructor(private http: HttpClient) {
    this.restServiceUrl = environment.restAndIoBackEndUrl  + '/auth';
  }

  start(name:string): Observable<JwtTokens> {
    console.log("start " + this.restServiceUrl)

    console.log(this.http)
    return this.http.post<JwtTokens>(this.restServiceUrl, {player: {name: name}}).pipe(
      map((authResult : JwtTokens) => {
        console.log("authResult")
        this.saveTokens(authResult.token, authResult.refreshToken);
        return authResult;
      })
    );
  }

  // TODO use shareReplay
  // TODO AuthService should get the active token (and refresh if necessary)
  refresh(refreshToken:string): Observable<JwtTokens> {
    return this.http.post<JwtTokens>(
      this.restServiceUrl + '/refresh', {},
      {headers:{"Authorization": "Bearer " + refreshToken}}
    ).pipe(
      map((authResult : JwtTokens) => {
        this.saveTokens(authResult.token, authResult.refreshToken);
        return authResult;
      })
    );
    // this is just the HTTP call,
    // we still need to handle the reception of the token
    //.shareReplay();
  }

  protected userConnectedSource = new Subject<User>();

  get hasUserConnected() : boolean {
    return StorageTokenTool.hasToken();
  }

  get userConnected() : User {
    let token_decoded : Payload = StorageTokenTool.decodedToken();
    return {ref: token_decoded.ref, name: token_decoded.name};
  }

  get userToken() : string {
    return this.getToken();
  }

  get userRefreshToken() : string {
    return this.getRefeshToken();
  }

  // Observable player streams
  userAnnounced$ = this.userConnectedSource.asObservable();

  // Service message commands
  announceUser(token_decoded: Payload) {
    this.userConnectedSource.next({ref: token_decoded.ref, name: token_decoded.name});
  }

  revokeUser() {

    this.userConnectedSource.next(null);
  }

  protected saveTokens(token : string, refreshToken : string) {
    StorageTokenTool.saveTokens(token, refreshToken);
  }

  protected deleteTokens() {
    StorageTokenTool.deleteTokens();
  }

  protected getToken() : string {
    return StorageTokenTool.token();
  }

  protected getRefeshToken() : string {
    return StorageTokenTool.refeshToken();
  }

}
