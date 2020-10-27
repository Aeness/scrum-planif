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
          this.takePartIn = true;
          this.afterInit();
        });
      }
    )
  }

  ngOnInit() {
    this.planifRoom.listenPlanifName().subscribe(
      (data) => {
        this.planif.name = data.name;
      }
    );
  }
  protected afterInit() {
    this.planifRoom.askToPlay();
  }
}
