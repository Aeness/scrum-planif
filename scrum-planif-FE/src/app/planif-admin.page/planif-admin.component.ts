import { Component } from '@angular/core';
import { PlanifComponent } from '../planif.page/planif.component';
import { PlanifRoom } from '../planif.room/planif.room';
import { FormControl } from '@angular/forms';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service/auth.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-planif-admin',
  templateUrl: 'planif-admin.component.html',
  styleUrls: ['./planif-admin.component.scss'],
  providers:  [ IoWebsocketService, PlanifRoom ] // IoWebsocketService is for PlanifRoom
})
export class PlanifAdminComponent extends PlanifComponent {
  public planifForm: FormGroup;
  public subjectForm: FormGroup;
  public gameForm: FormGroup;

  public faEdit = faEdit;

  public resultsVisibilityChoosen = new FormControl(false);

  // https://www.pinterest.fr/pin/194288171399705962/
  constructor(
    protected route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    protected authService: AuthService,
    private fb: FormBuilder) {

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

    this.init$.subscribe(
      (init) => {
        if (init == true) {
          this.planifRoom.name$.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (data) => {
              // TODO use the value of planifRoom ?
              if (this.planifForm.controls.name.value != data) {
                this.planifForm.patchValue({
                  name: data
                });
              }
            }
          );
          this.planifRoom.subject$.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (data) => {
              if (this.subjectForm.controls.subject.value != data) {
                this.subjectForm.patchValue({
                  subject: data
                });
              }
            }
          );
          this.planifRoom.resultsVisibility$.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (data) => {
              if (this.resultsVisibilityChoosen.value != data) {
                this.resultsVisibilityChoosen.setValue(data);
              }
            }
          );
        }
      }
    )
  }

  protected askToPlayOrNot() {
    // Not ask
  }

  public resultsVisibilityChoosenChange() {
    this.planifRoom.sendResultsVisibility(this.resultsVisibilityChoosen.value);
  }

  onPlanifSubmit() {
    if(this.planifForm.valid) {
      // Send also to itself
      this.planifRoom.sendPlanifName(this.planifForm.controls.name.value)
    }
  }

  onSubjectSubmit() {
    if(this.subjectForm.valid) {
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
