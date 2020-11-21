import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Player } from '../auth.service/player';
import { faCog, faSmile } from '@fortawesome/free-solid-svg-icons';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss']
})
export class PlayersComponent implements OnInit {
  faCog = faCog;
  faSmile = faSmile;

  @Input() planifRoom: PlanifRoom;

  votes$: Observable<Map<String, {player: Player, vote : String}>> ;
  votes: Map<String, {player: Player, vote : String}> = new Map<String, {player: Player, vote : String}>();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {

    this.planifRoom.askPlayersList().then(
      (data: Map<String, Player>) => {
        data.forEach((player, ref_player) => {
          this.votes.set(ref_player, {player: player, vote : null});
        })
        this.votes$ = of(this.votes);

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
            console.log(dataChoise)
            console.log(dataChoise.choosenValue)
            this.votes.get(dataChoise.player_ref).vote = dataChoise.choosenValue;
          }
        );
      }
    );
  }

}
