import { Component, OnInit, Input } from '@angular/core';
import { PlanifRoom } from '../planif.room/planif.room';
import { Player } from '../auth.service/player';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-players-list',
  templateUrl: 'players-list.component.html',
  providers:  [ PlanifRoom ] // TODO to keep ?
})
export class PlayersListComponent implements OnInit {

  @Input() planifRoom: PlanifRoom;

  players$: Observable<Map<String, Player>> ;
  protected players: Map<String, Player> = new Map<String, Player>();

  constructor() { }

  ngOnInit() {

    this.planifRoom.askPlayersList().then(
      (data: Map<String, Player>) => {
        for (var ref_player in data) {
          this.players.set(ref_player, data[ref_player]);
        }

        this.players$ = of(this.players);

        this.planifRoom.listenPlayerJoinPlanif().subscribe(
          (data: { player: Player; }) => {
            console.log("getNewPlayer");
            console.log(data.player);
            this.players.set(data.player.ref, data.player);
          }
        );

        this.planifRoom.listenPlayerQuitPlanif().subscribe(
          (data: { player_ref: String; }) => {
            console.log("deletePlayer");
            console.log(data.player_ref);
            this.players.delete(data.player_ref);
          }
        );
      }
    );
  }
}
