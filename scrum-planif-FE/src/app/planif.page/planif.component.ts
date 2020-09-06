import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';
import { Player } from '../auth.service/player';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html',
  providers:  [ PlanifRoom ]
})
export class PlanifComponent implements OnInit {
  protected planif_ref : String;
  protected joined: boolean = false;
  protected players: Map<String, Player> = new Map<String, Player>();

  constructor(
    private route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    private authService: AuthService
  ) {
    this.route.params.subscribe(
      params => {
        this.planif_ref = params.planif_ref;
        this.planifRoom.init(this.planif_ref);
      }
    )
  }

  ngOnInit() {
    // TODO : use only when the connexion is OK
    this.planifRoom.sendJoinThePlanif(this.authService.playerConnected).then(
      (data: Map<String, Player>) => {
        this.joined = true;
        for (var ref_player in data) {
          this.players.set(ref_player, data[ref_player]);
        }
      }
    );
  }

}
