import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';
import { Planif } from '../planif.room/planif';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html',
  styleUrls: ['./planif.component.scss'],
  providers:  [ PlanifRoom ]
})
export class PlanifComponent {

  public planif : Planif = new Planif();
  public init: boolean = false;
  public takePartIn: boolean = false;


  constructor(
    protected route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    protected authService: AuthService
  ) {
    this.route.params.subscribe(
      params => {
        var routePlanifRef = params.planif_ref;
        this.planifRoom.init2(routePlanifRef, this.authService.playerConnected).subscribe(
          (data : Planif) => {
            this.planif = data;
            this.init = true;
            this.takePartIn = true;
            this.afterInit();
        })
      }
    )
  }

  ngOnInit() {
    // TODO move it in the the planif room with a BehaviorSubject
    this.planifRoom.listenPlanifName().subscribe(
      (data) => {
        this.planif.name = data.name;
      }
    );
  }

  // TODO rename to afterPlanifRoomInit
  protected afterInit() {
    this.planifRoom.askToPlay();
  }
}
