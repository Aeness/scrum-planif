import { AuthService } from "./auth.service";
import { User } from "./user";

export class AuthServiceMock extends AuthService {
  private user : User;

  constructor(user : User) {
    super(null);
    this.user = user;
    this.userConnectedSource.next(user);
  }

  get userConnected() : User {
    return this.user;
  }

}
