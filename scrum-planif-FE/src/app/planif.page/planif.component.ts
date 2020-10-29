import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';
import { Observable, of } from 'rxjs';
import { Player } from '../auth.service/player';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html',
  providers:  [ PlanifRoom ]
})
export class PlanifComponent {
  protected planif_ref : String;
  protected joined: boolean = false;

  votes$: Observable<Map<String, {player: Player, vote : String}>> ;
  votes: Map<String, {player: Player, vote : String}> = new Map<String, {player: Player, vote : String}>();

  constructor(
    private route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    private authService: AuthService
  ) {
    this.route.params.subscribe(
      params => {
        this.planif_ref = params.planif_ref;
        this.planifRoom.init(this.planif_ref, this.authService.playerConnected, () => {
          this.joined = true;

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
        });
      }
    )
  }
}
