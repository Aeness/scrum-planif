import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Player } from '../auth.service/player';
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

  //votes$: Observable<Map<String, {player: Player, vote : String}>> ;
  //votes: Map<String, {player: Player, vote : String}> = new Map<String, {player: Player, vote : String}>();

  public players: Map<String, Player> = new Map<String, Player>();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {

    this.planifRoom.playersList$.subscribe(
      (data: Map<String, Player>) => {
        this.players = data;
      }
    );
  }

}
