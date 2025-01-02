import { Component, Input, OnDestroy, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { PlanifRoom } from '../planif.room/planif.room';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-add-game-cards',
  templateUrl: './add-game-cards.component.html',
  styleUrls: ['../card/font-icon.scss', '../cards-game/cards-game.component.scss', './add-game-cards.component.scss','../choose-cards-game/choose-cards-game.component.scss'],
  providers:  [ BsModalService ]
})
export class AddGameCardsComponent implements OnDestroy {
  private unsubscribe$ = new Subject();

  @Input() planifRoom: PlanifRoom;


  public cardForm: UntypedFormGroup;
  public userCardsGame : Array<any> = [];
  public fixCardsGame : Array<any> =[
    {value:"&#xf128", active: false},
    {value:"&#xf534;", active: false},
    {value:"&#xf0f4;", active: false}
  ];

  public faTimes = faTimes;
  public faInfoCircle = faInfoCircle;
  modalReference : BsModalRef

  constructor(
    private modalService: BsModalService,
    private fb: UntypedFormBuilder
  ) {

    this.cardForm = fb.group({
      cardValue: ['', Validators.compose([Validators.required, Validators.maxLength(3)]) ]
    });
    modalService.onShow.subscribe(() => {console.log("modalService.onShow")});
  }

  openModal(template: TemplateRef<void>) {
    this.cardForm.reset();
    this.cardForm.markAsUntouched();


    this.modalReference = this.modalService.show(template, { class: 'modal-dialog-centered' });
    this.modalReference.onHide.subscribe((/*modalDismissReasons: string*/) => {
      // modalDismissReasons : esc, backdrop-click or other (object...)
      this.userCardsGame = [];
      console.log("modalReference.onHide");
    })
  }

  sendGame(): void {
    // Closed (and validate)
    this.modalService.setDismissReason('Save click');
    this.planifRoom.sendNewGame(this.userCardsGame.concat(this.fixCardsGame));
    this.modalReference.hide();
  }

  closeWithoutSend(reason: string): void {
    this.modalService.setDismissReason(reason);
    this.modalReference.hide();
  }

  onCardSubmit(/*event*/) {
    if(this.cardForm.valid) {
      this.userCardsGame.push({value:this.cardForm.controls.cardValue.value, active: true});
      this.cardForm.reset();
      this.cardForm.markAsUntouched();
    }
  }

  click(type : "user" | "fix", index) {
    if (type == "user") {
      this.userCardsGame[index].active = !this.userCardsGame[index].active ;
    } else {
      this.fixCardsGame[index].active = !this.fixCardsGame[index].active ;
    }
  }

  drop(event: CdkDragDrop<Array<any>>) {
    moveItemInArray(this.userCardsGame, event.previousIndex, event.currentIndex);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.modalReference) {
      this.modalReference.hide();
    }
  }

}
