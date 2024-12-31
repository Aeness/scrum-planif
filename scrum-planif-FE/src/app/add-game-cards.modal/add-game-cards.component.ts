import { Component, Input, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { PlanifRoom } from '../planif.room/planif.room';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-add-game-cards',
  templateUrl: './add-game-cards.component.html',
  styleUrls: ['../card/font-icon.scss', '../cards-game/cards-game.component.scss', './add-game-cards.component.scss','../choose-cards-game/choose-cards-game.component.scss']
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
  modalReference : NgbModalRef

  constructor(
    private modalService: NgbModal,
    private fb: UntypedFormBuilder
  ) {

    this.cardForm = fb.group({
      cardValue: ['', Validators.compose([Validators.required, Validators.maxLength(3)]) ]
    });
  }

  openModal(content) {
    this.cardForm.reset();
    this.cardForm.markAsUntouched();

    this.modalReference = this.modalService.open(content, { centered:true, container: '.attachModal' });
    this.modalReference.result.then(
      (/*result*/) => {
        // Closed (and validate)
        this.planifRoom.sendNewGame(this.userCardsGame.concat(this.fixCardsGame));
        this.userCardsGame = [];
      },
      (/*reason*/) => {
        // Dismissed
        // ModalDismissReasons.ESC or ModalDismissReasons.BACKDROP_CLICK or other
        this.userCardsGame = [];
      },
    );
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

  closeModal(modal) {
    modal.close('Save click');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.modalReference) {
      this.modalReference.close();
    }
  }

}
