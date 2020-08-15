import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent }
  from '@angular/common/http';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service/auth.service';
import { StorageTokenTool } from '../auth.service/storage-token.tool';
import * as moment from 'moment';
import { JwtTokens } from '../auth.service/jwtTokens';

/**
 * Refresh and add the JWT token to the request to the http server.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService
    ) { }

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

        if (((req.url.endsWith("/auth") || req.url.endsWith("/auth/refresh")) && req.method == "POST")) {
            return next.handle(req);
        } else {
            const current_ts: number = Math.trunc(moment().valueOf() / 1000);
            if(current_ts >= StorageTokenTool.decodedToken().exp - 1) {
              return this.authService.refresh(StorageTokenTool.refeshToken()).pipe<HttpEvent<any>>(
                  switchMap<JwtTokens, Observable<HttpEvent<any>>>(
                  (authResult: JwtTokens) => {
                      StorageTokenTool.saveTokens(authResult.token, authResult.refreshToken);
                      return next.handle(this.addTheToken(req, StorageTokenTool.token()));
                  }
              ))
            } else {
                return next.handle(this.addTheToken(req, StorageTokenTool.token()));
            }
        }
    }

    private addTheToken(req: HttpRequest<any>, token: string): HttpRequest<any> {

        if (token) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization",
                    "Bearer " + token)
            });

            return cloned;
        }
        else {
            return req;
        }

    }
}
