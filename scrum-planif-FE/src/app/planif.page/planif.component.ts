import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html',
  providers:  [ PlanifRoom ]
})
export class PlanifComponent {
  protected planif_ref : String;
  protected joined: boolean = false;

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
        });
      }
    )
  }
}
