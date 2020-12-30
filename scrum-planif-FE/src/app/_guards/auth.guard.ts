import { Injectable, Injector } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as moment from 'moment';
import { AuthService } from '../auth.service/auth.service';
import { Observable, of as observableOf } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StorageTokenTool } from '../auth.service/storage-token.tool';
import { JwtTokens } from '../auth.service/jwtTokens';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private injector: Injector,
        private authService: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean | Observable<boolean> {
        const router = this.injector.get(Router);
        if (StorageTokenTool.hasToken()) {
            const currentDate = moment();
            const current_ts: number = Math.trunc(currentDate.valueOf() / 1000);
            if(current_ts >= StorageTokenTool.decodedToken().exp - 1) {
                return this.authService.refresh(StorageTokenTool.refeshToken()).pipe<boolean,boolean>(
                    map<JwtTokens, boolean>((authResult: JwtTokens) => {
                        StorageTokenTool.saveTokens(authResult.token, authResult.refreshToken);
                        // refresh succed so return true
                        return true;
                    }),
                    catchError((err, caught) => {
                        StorageTokenTool.deleteTokens();
                        // refresh fails so revoke the user and redirect to login page
                        this.authService.revokePlayer();
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
            this.authService.revokePlayer();
            router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }
    }
}
