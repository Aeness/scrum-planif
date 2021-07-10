import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LoginPerson } from './auth.service/login-person';
import { AuthService } from './auth.service/auth.service';
import { Subject, Subscription } from 'rxjs';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { takeUntil } from 'rxjs/operators';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  faSignOutAlt = faSignOutAlt;
  title = 'scrum-planif';
  user : LoginPerson ;
  subscription: Subscription;

  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer: ToastContainerDirective;

  constructor(private authService: AuthService, private toastrService: ToastrService) {
    this.subscription = authService.userAnnounced$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (user : LoginPerson) => {
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

  ngOnInit() {
    this.toastrService.overlayContainer = this.toastContainer;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
