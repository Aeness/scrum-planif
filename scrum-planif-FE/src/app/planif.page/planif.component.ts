import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';
import { StorageTokenTool } from '../auth.service/storage-token.tool';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html',
  styleUrls: ['./planif.component.scss'],
  providers:  [ PlanifRoom ]
})
export class PlanifComponent {

  public init: boolean = false;
  public planif : {ref: string, name: String, subject: String};
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
        if (!StorageTokenTool.hasToken()) {
          // TODO Display a message in a toast
          window.location.reload();
        }
        this.planifRoom.init(this.planif.ref, () => {
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
