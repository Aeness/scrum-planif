import { Injectable, Injector } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as moment from 'moment';
import { AuthService } from '../auth.service/auth.service';
import { Observable, of as observableOf } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JwtTokens } from '../auth.service/jwtTokens';
import { TokenTool } from "../auth.service/token.tool";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private injector: Injector,
        private authService: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean | Observable<boolean> {
        const router = this.injector.get(Router);
        if (this.authService.hasUserConnected) {
            const currentDate = moment();
            if(!TokenTool.tokenIsOk(this.authService.userToken)) {
                return this.authService.refresh(this.authService.userRefreshToken).pipe<boolean,boolean>(
                    map<JwtTokens, boolean>((authResult: JwtTokens) => {
                        // refresh succed so return true
                        return true;
                    }),
                    catchError((err, caught) => {
                        // refresh fails so revoke the user and redirect to login page
                        this.authService.revokeUser();
                        router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
                        return observableOf(false);
                    }
                    )
                );

            } else {
                // logged in so return true
                return true;
            }
        } else {
            // not logged in so revoke the user and redirect to login page
            this.authService.revokeUser();
            router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }
    }
}
