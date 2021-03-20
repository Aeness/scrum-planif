import { Component, OnDestroy } from '@angular/core';
import { User } from './auth.service/user';
import { AuthService } from './auth.service/auth.service';
import { Subject, Subscription } from 'rxjs';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  private unsubscribe$ = new Subject();

  faSignOutAlt = faSignOutAlt;
  title = 'scrum-planif';
  user : User ;
  subscription: Subscription;

  constructor(private authService: AuthService) {
    this.subscription = authService.userAnnounced$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (user : User) => {
        this.user = user;
      }
    );

    if (authService.hasUserConnected) {
      this.user = authService.userConnected;
    }
  }

  get userConnected() : boolean {
    return this.user != null;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
