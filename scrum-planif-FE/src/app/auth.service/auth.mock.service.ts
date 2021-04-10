import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { LoginPerson } from "./login-person";

@Injectable()
export class AuthServiceMock extends AuthService {
  private user : LoginPerson;
  //private token : string;
  //private refreshToken : string;

  constructor(user : LoginPerson) {
    super(null);
    this.user = user;
    this.userConnectedSource.next(user);
  }

  get userConnected() : LoginPerson {
    return this.user;
  }

  get hasUserConnected() : boolean {
    return true;
  }
/*
  protected saveTokens(token : string, refreshToken : string) {
    this.token = token;
    this.refreshToken = refreshToken;
  }

  protected deleteTokens() {
    this.token = null;
    this.refreshToken = null;
    this.userConnectedSource.next(null);
  }

  protected getToken() : string {
    return this.token;
  }

  protected getRefeshToken() : string {
    return this.refreshToken;
  }
*/
}
