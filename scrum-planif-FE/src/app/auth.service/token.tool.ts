import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { Payload } from './payload';

export class TokenTool {

    static tokenIsOk(token : String) : boolean {
      const current_ts: number = Math.trunc(moment().valueOf() / 1000);
      if(token === null || current_ts >= TokenTool.decodeToken(token).exp - 1) {
        return false;
      } else {
        return true;
      }
    }

    static decodeToken(token : String) : Payload {
      if (token !== null) {
        return jwt_decode(token);
      } else {
        return null;
      }
    }
}
