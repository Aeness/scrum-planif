import { Component } from '@angular/core';
import { PlanifComponent } from '../planif.page/planif.component';
import { PlanifRoom } from '../planif.room/planif.room';
import { FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service/auth.service';

@Component({
  selector: 'app-planif-admin',
  templateUrl: 'planif-admin.component.html',
  styleUrls: ['./planif-admin.component.scss'],
  providers:  [ PlanifRoom ]
})
export class PlanifAdminComponent extends PlanifComponent {
  planifForm: FormGroup;

  iVote = new FormControl(false);
  urlLink = environment.linkUrl;
  faCopy = faCopy;

  resultsVisibilityChoosen = new FormControl(false);

  constructor(
    protected route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    protected authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
      super(route, planifRoom, authService)
      this.planifForm = fb.group({
        name: ['', Validators.required]
      });
    }

  protected afterInit() {
    this.planifRoom.name$.subscribe(
      (data) => {
        // TODO use the value of planifRoom ?
        if (this.planifForm.controls.name.value != data) {
          this.planifForm.patchValue({
            name: data
          });
        }
      }
    );
    this.planifRoom.resultsVisibility$.subscribe(
      (data) => {
        // TODO use the value of planifRoom ?
        if (this.resultsVisibilityChoosen.value != data) {
          this.resultsVisibilityChoosen.setValue(data);
        }
      }
    );
    // An admin doesn't play
  }

  public iVoteChange() {
    if (this.iVote.value == true) {
      this.planifRoom.askToPlay();
    } else {
      this.planifRoom.askToNotPlay();
    }
  }

  public resultsVisibilityChoosenChange() {
    this.planifRoom.sendResultsVisibility(this.resultsVisibilityChoosen.value);
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

  onSubmit() {
    if(this.planifForm.valid) {
      // Send also to itself
      this.planifRoom.sendPlanifName(this.planifForm.controls.name.value)
    }
  }

}
