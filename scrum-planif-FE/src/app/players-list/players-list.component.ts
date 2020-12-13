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

  votes$: Observable<Map<String, {player: Player, vote : String}>> ;
  votes: Map<String, {player: Player, vote : String}> = new Map<String, {player: Player, vote : String}>();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {

    this.planifRoom.playersList$.subscribe(
      (data: Map<String, Player>) => {
        data.forEach((player, ref_player) => {
          this.votes.set(ref_player, {player: player, vote : null});
        })
        this.votes$ = of(this.votes);

        // TODO if a player arrives beetwen playersList$.subscribe and this.planifRoom.listenPlayerJoinPlanif()
        // TODO if get vote before player
        this.planifRoom.listenPlayerJoinPlanif().subscribe(
          (dataJoin: { player: Player; }) => {
            this.votes.set(dataJoin.player.ref, {player: dataJoin.player, vote : null});
          }
        );

        this.planifRoom.listenPlayerQuitPlanif().subscribe(
          (dataQuit: { player_ref: String; }) => {
            this.votes.delete(dataQuit.player_ref);
          }
        );

        this.planifRoom.listenPlanifChoise().subscribe(
          (dataChoise: {player_ref: String, choosenValue : String}) => {
            this.votes.get(dataChoise.player_ref).vote = dataChoise.choosenValue;
          }
        );
      }
    );
  }

}
