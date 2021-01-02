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
  public planif : {ref: String, name: String, subject: String};
  public takePartIn: boolean = false;
  public resultsVisibility: Boolean = false;


  constructor(
    protected route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    protected authService: AuthService
  ) {
    this.route.params.subscribe(
      params => {
        this.planif = {
          ref: params.planif_ref,
          name : '',
          subject : ''
        };
        this.planifRoom.init(this.planif.ref, this.authService.userConnected, () => {
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
    this.planifRoom.subject$.subscribe(
      (data) => {
        this.planif.subject = data;
      }
    );
    this.planifRoom.askToPlay();

    this.planifRoom.resultsVisibility$.subscribe(
      (data: Boolean) => {
        this.resultsVisibility = data;
      }
    );
  }
}
