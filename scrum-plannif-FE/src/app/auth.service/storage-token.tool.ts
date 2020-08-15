import * as jwt_decode from 'jwt-decode';
import { Payload } from './payload';

// TODO find a way to add methode to sessionStorage instead
export class StorageTokenTool {

    static saveTokens(token: string, refreshToken: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refreshToken);
    }

    static hasToken() : boolean {
        return (localStorage.getItem('token') !== null);
    }

    static token() : string {
        return localStorage.getItem('token');
    }

    static refeshToken() : string {
        return localStorage.getItem('refresh_token');
    }

    static decodedToken() : Payload {
        return StorageTokenTool.decodeToken(localStorage.getItem('token'));
    }

    static decodeToken(token : String) : Payload {
        if (token !== null) {
            return jwt_decode(token);
        } else {
            return null;
        }
    }

    static deleteTokens() {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
    }

}
