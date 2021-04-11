import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { faChessQueen, faEye, faPersonBooth } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlanifRoom } from '../planif.room/planif.room';
import { User } from '../planif.room/user';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject();

  public faChessQueen = faChessQueen;
  public faEye = faEye;
  public faPersonBooth = faPersonBooth;

  @Input() planifRoom: PlanifRoom;

  public users: Map<string, User> = new Map<string, User>();

  constructor() { }

  ngOnInit(): void {

    this.planifRoom.usersList$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data: Map<string, User>) => {
        this.users = data;
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
