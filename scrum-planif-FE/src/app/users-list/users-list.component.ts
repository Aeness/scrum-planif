import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { faChessQueen, faEye, faCog, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlanifRoom } from '../planif.room/planif.room';
import { User } from '../planif.room/user';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['../card/font-icon.scss', './users-list.component.scss']
})
export class UsersListComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject();

  public faChessQueen = faChessQueen;
  public faEye = faEye;
  public faCheck = faCheck;
  public faCog = faCog;

  @Input() planifRoom: PlanifRoom;
  @Input() isAdmin: boolean;

  public resultsVisibility : boolean = false;

  public users: Map<string, User> = new Map<string, User>();

  constructor() { }

  ngOnInit(): void {

    this.planifRoom.usersList$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data: Map<string, User>) => {
        this.users = data;
      }
    );

    this.planifRoom.resultsVisibility$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data) => {
        this.resultsVisibility = data;
      }
    );
  }

  public resultsVisibilityChange(resultsVisibilityChoosen : boolean) {
    this.planifRoom.sendResultsVisibility(resultsVisibilityChoosen);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
