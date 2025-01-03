import { inject } from "@angular/core";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import * as moment from 'moment';
import { AuthService } from '../auth.service/auth.service';
import { of as observableOf } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JwtTokens } from '../auth.service/jwtTokens';
import { TokenTool } from "../auth.service/token.tool";

export const canActivateJwt: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const router = inject(Router);
        const authService = inject(AuthService);
        if (authService.hasUserConnected) {
            const currentDate = moment();
            if(!TokenTool.tokenIsOk(authService.userToken)) {
                return authService.refresh(authService.userRefreshToken).pipe<boolean,boolean>(
                    map<JwtTokens, boolean>((authResult: JwtTokens) => {
                        // refresh succed so return true
                        return true;
                    }),
                    catchError((err, caught) => {
                        // refresh fails so revoke the user and redirect to login page
                        authService.revokeUser();
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
            authService.revokeUser();
            router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }
}
