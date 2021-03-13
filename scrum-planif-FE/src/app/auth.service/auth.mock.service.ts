import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { User } from "./user";

@Injectable()
export class AuthServiceMock extends AuthService {
  private user : User;
  //private token : string;
  //private refreshToken : string;

  constructor(user : User) {
    super(null);
    this.user = user;
    this.userConnectedSource.next(user);
  }

  get userConnected() : User {
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
  }

  protected getToken() : string {
    return this.token;
  }

  protected getRefeshToken() : string {
    return this.refreshToken;
  }
*/
}
