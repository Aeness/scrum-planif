import { Payload } from './payload';
import { TokenTool } from './token.tool';

// Data are share beetwen regular application and socket-io client.
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
        return TokenTool.decodeToken(localStorage.getItem('token'));
    }

    static deleteTokens() {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
    }

}
