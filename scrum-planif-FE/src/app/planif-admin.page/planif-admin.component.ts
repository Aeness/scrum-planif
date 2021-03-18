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
import { IoWebsocketService } from '../_rooms/io-websocket.service';

@Component({
  selector: 'app-planif-admin',
  templateUrl: 'planif-admin.component.html',
  styleUrls: ['../card/font-icon.scss', './planif-admin.component.scss'],
  providers:  [ IoWebsocketService, PlanifRoom ] // IoWebsocketService is for PlanifRoom
})
export class PlanifAdminComponent extends PlanifComponent {
  public planifForm: FormGroup;
  public subjectForm: FormGroup;
  public gameForm: FormGroup;

  public urlLink = environment.linkUrl;
  public faCopy = faCopy;
  public faEdit = faEdit;

  public resultsVisibilityChoosen = new FormControl(false);
  public gameTypeChoosen = new FormControl(false);

  public cards : Array<{value: string, active: boolean}>;

  // https://www.pinterest.fr/pin/194288171399705962/
  constructor(
    protected route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    protected authService: AuthService,
    private router: Router,
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
          this.planifRoom.cardsList$.subscribe(
            (data) => {
              this.cards = data;
              // TODO do better
              if (Array.isArray(data) && data.length > 0 && data[0].value == "XS"
                  && this.gameTypeChoosen.value !== true) {
                this.gameTypeChoosen.setValue(true);
              }
            }
          );
        }
      }
    )
  }

  public resultsVisibilityChoosenChange() {
    this.planifRoom.sendResultsVisibility(this.resultsVisibilityChoosen.value);
  }

  public gameTypeChoosenChange() {
    if (this.gameTypeChoosen.value) {
      this.planifRoom.sendTypeGameToTshirt();
    } else {
      this.planifRoom.sendTypeGameToNumber();
    }
  }

  public copyElement(idElement) {
    let range = document.createRange();
    let selection = window.getSelection();
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

  click(index) {
    //this.cards[index].active = !this.cards[index].active ;
    this.planifRoom.sendCardVisibility(index, !this.cards[index].active);
  }

}
