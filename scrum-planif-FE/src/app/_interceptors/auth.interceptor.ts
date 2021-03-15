import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent }
  from '@angular/common/http';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service/auth.service';
import { JwtTokens } from '../auth.service/jwtTokens';
import { TokenTool } from '../auth.service/token.tool';

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
          let token = this.authService.userToken;
          if (!TokenTool.tokenIsOk(token)) {
            return this.authService.refresh(this.authService.userRefreshToken).pipe<HttpEvent<any>>(
                switchMap<JwtTokens, Observable<HttpEvent<any>>>(
                (authResult: JwtTokens) => {
                    return next.handle(this.addTheToken(req, authResult.token));
                }
            ))
          } else {
            return next.handle(this.addTheToken(req, this.authService.userToken));
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
