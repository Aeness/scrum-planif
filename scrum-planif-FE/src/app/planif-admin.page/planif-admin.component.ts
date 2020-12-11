import { Component } from '@angular/core';
import { PlanifComponent } from '../planif.page/planif.component';
import { PlanifRoom } from '../planif.room/planif.room';
import { FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';
import { faCopy } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-planif-admin',
  templateUrl: 'planif-admin.component.html',
  styleUrls: ['./planif-admin.component.scss'],
  providers:  [ PlanifRoom ]
})
export class PlanifAdminComponent extends PlanifComponent {
  iVote = new FormControl(false);
  urlLink = environment.linkUrl;
  faCopy = faCopy;

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

  public copyElement(idElement) {
    var range = document.createRange();
    var selection = window.getSelection();
    range.selectNode(document.getElementById(idElement));
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        if (document.execCommand('copy')) {
          console.log('The copy succeed');
        }
    }
    catch(err) {
        console.error(err);
    }
  }
}
