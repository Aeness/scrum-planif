import { jwtDecode } from "jwt-decode";
import { Payload } from './payload';

export class TokenTool {

    static tokenIsOk(token : string) : boolean {
      const current_ts: number = Math.trunc(Date.now() / 1000);
      if(token === null || current_ts >= TokenTool.decodeToken(token).exp - 1) {
        return false;
      } else {
        return true;
      }
    }

    static decodeToken(token : string) : Payload {
      if (token !== null) {
        return jwtDecode<Payload>(token);
      } else {
        return null;
      }
    }
}
