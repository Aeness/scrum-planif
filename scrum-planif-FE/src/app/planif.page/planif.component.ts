import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html',
  providers:  [ PlanifRoom ]
})
export class PlanifComponent implements OnInit{
  protected planif_ref : String;

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
    this.planifRoom.sendJoinThePlanif(this.authService.playerConnected);
  }

}
