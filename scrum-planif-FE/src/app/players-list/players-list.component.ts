import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Player } from '../planif.room/player';
import { faCog, faSmile } from '@fortawesome/free-solid-svg-icons';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  // TOOD rename the component or the selector
  selector: 'app-players',
  templateUrl: './players-list.component.html',
  styleUrls: ['../card/font-icon.scss', './players-list.component.scss']
})
export class PlayersListComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject();

  faCog = faCog;
  faSmile = faSmile;

  @Input() planifRoom: PlanifRoom;

  public resultsVisibility : boolean = false;
  public players: Map<string, Player> = new Map<string, Player>();

  constructor(
    protected authService: AuthService // for the template and ResultsListAdminComponent
  ) { }

  ngOnInit(): void {

    this.planifRoom.playersList$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data: Map<string, Player>) => {
        this.players = data;
      }
    );

    this.planifRoom.resultsVisibility$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data) => {
        this.resultsVisibility = data;
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
