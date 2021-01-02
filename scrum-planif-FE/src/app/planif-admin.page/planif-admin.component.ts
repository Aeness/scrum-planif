import { Component } from '@angular/core';
import { PlanifComponent } from '../planif.page/planif.component';
import { PlanifRoom } from '../planif.room/planif.room';
import { FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
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
  subjectForm: FormGroup;
  gameForm: FormGroup;

  iVote = new FormControl(false);
  urlLink = environment.linkUrl;
  faCopy = faCopy;
  faEdit = faEdit;

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
      this.subjectForm = fb.group({
        subject: [''/*, Validators.required*/]
      });
      this.gameForm = fb.group({
        subject: [''/*, Validators.required*/]
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
    this.planifRoom.subject$.subscribe(
      (data) => {
        if (this.subjectForm.controls.subject.value != data) {
          this.subjectForm.patchValue({
            subject: data
          });
        }
      }
    );
    this.planifRoom.resultsVisibility$.subscribe(
      (data) => {
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

  onPlanifSubmit() {
    if(this.planifForm.valid) {
      // Send also to itself
      this.planifRoom.sendPlanifName(this.planifForm.controls.name.value)
    }
  }

  onSubjectSubmit() {
    if(this.gameForm.valid) {
      // Send also to itself
      this.planifRoom.sendGameSubject(this.subjectForm.controls.subject.value)
    }
  }

  onGameSubmit() {
    if(this.gameForm.valid) {
      this.planifRoom.sendRestartGameSubject(this.gameForm.controls.subject.value)
      this.gameForm.patchValue({
        subject: ''
      });
    }
  }

}
