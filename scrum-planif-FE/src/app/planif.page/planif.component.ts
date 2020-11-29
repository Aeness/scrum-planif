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

  public planif_ref : String;
  public takePartIn: boolean = false;


  constructor(
    private route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    private authService: AuthService
  ) {
    this.route.params.subscribe(
      params => {
        this.planif_ref = params.planif_ref;
        this.planifRoom.init(this.planif_ref, this.authService.playerConnected, () => {
          this.takePartIn = true;
          this.afterInit();
        });
      }
    )
  }

  protected afterInit() {
    this.planifRoom.askToPlay();
  }
}
