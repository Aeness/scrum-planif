import { Component } from '@angular/core';
import { PlanifComponent } from '../planif.page/planif.component';
import { PlanifRoom } from '../planif.room/planif.room';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-planif-admin',
  templateUrl: 'planif-admin.component.html',
  styleUrls: ['./planif-admin.component.scss'],
  providers:  [ PlanifRoom ]
})
export class PlanifAdminComponent extends PlanifComponent {
  iVote = new FormControl(false);

  protected afterInit() {
    // An admin doesn't play
  }

  private iVoteChange() {
    if (this.iVote.value == true) {
      this.planifRoom.askToPlay();
    } else {
      this.planifRoom.askToNotPlay();
    }
  }
}
