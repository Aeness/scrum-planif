import { Component } from '@angular/core';
import { User } from './auth.service/user';
import { AuthService } from './auth.service/auth.service';
import { Subscription } from 'rxjs';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  faSignOutAlt = faSignOutAlt;
  title = 'scrum-planif';
  user : User ;
  subscription: Subscription;

  constructor(private authService: AuthService) {
    this.subscription = authService.userAnnounced$.subscribe(
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
}
