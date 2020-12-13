import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html',
  styleUrls: ['./planif.component.scss'],
  providers:  [ PlanifRoom ]
})
export class PlanifComponent {

  public init: boolean = false;
  public planif : {ref: String, name: String};
  public takePartIn: boolean = false;


  constructor(
    protected route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    protected authService: AuthService
  ) {
    this.route.params.subscribe(
      params => {
        this.planif = {
          ref: params.planif_ref,
          name : ''
        };
        this.planifRoom.init(this.planif.ref, this.authService.playerConnected, () => {
          this.init = true;
          this.takePartIn = true;
          this.afterInit();
        });
      }
    )
  }

  // TODO rename to afterPlanifRoomInit
  protected afterInit() {
    this.planifRoom.name$.subscribe(
      (data) => {
        this.planif.name = data;
      }
    );
    this.planifRoom.askToPlay();
  }
}
