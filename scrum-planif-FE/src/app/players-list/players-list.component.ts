import { Component, OnInit, Input } from '@angular/core';
import { PlanifRoom } from '../planif.room/planif.room';
import { Player } from '../auth.service/player';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-players-list',
  templateUrl: 'players-list.component.html',
  providers:  [ PlanifRoom ]
})
export class PlayersListComponent implements OnInit {

  @Input() planifRoom: PlanifRoom;
  @Input() players: Map<String, Player> ;

  players$: Observable<Map<String, Player>> ;

  constructor() { }

  ngOnInit() {
    this.players$ = of(this.players);

    this.planifRoom.listenPlayerJoinPlanif().subscribe(
      (data: { player: Player; }) => {
        console.log("getNewPlayer");
        console.log(data.player);
        this.players.set(data.player.ref, data.player);
      }
    );
  }
}
