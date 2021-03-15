import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../planif.room/player';
import { faCog, faSmile } from '@fortawesome/free-solid-svg-icons';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';

@Component({
  selector: 'app-players',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss']
})
export class PlayersListComponent implements OnInit {
  faCog = faCog;
  faSmile = faSmile;

  @Input() planifRoom: PlanifRoom;

  public players: Map<string, Player> = new Map<string, Player>();

  constructor(
    protected authService: AuthService // for the template
  ) { }

  ngOnInit(): void {

    this.planifRoom.playersList$.subscribe(
      (data: Map<string, Player>) => {
        this.players = data;
      }
    );
  }

}
