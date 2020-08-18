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

  players$: Observable<Map<String, Player>> ;
  players: Map<String, Player> ;

  constructor() { }

  ngOnInit() {
    this.players = new Map<String, Player>();
    this.players$ = of(this.players);


    this.planifRoom.askPlayers().subscribe(
      (data) => {
        for (var ref_player in data) {
          this.players.set(ref_player, data[ref_player]);
        }
      }
    );

    this.planifRoom.listenPlayerJoinPlanif().subscribe(
      (data: { player: Player; }) => {
        console.log("getNewPlayer");
        console.log(data.player);
        this.players.set(data.player.ref, data.player);
      }
    );
  }
}
