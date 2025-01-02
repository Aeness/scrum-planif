import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { PlanifRoom } from '../planif.room/planif.room';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { AddGameCardsComponent } from './add-game-cards.component';

fdescribe('AddGameCardsComponent', () => {
  let component: AddGameCardsComponent;
  let fixture: ComponentFixture<AddGameCardsComponent>;
  let ioWebsocketService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGameCardsComponent ],
      imports: [
        FontAwesomeModule,
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot(),
        ModalModule
      ],
      providers: [
        UntypedFormBuilder,
        ToastrService, // for PlanifRoom
        {provide: IoWebsocketService, useClass: IoWebsocketMockService}, // for PlanifRoom
        BsModalService

      ]
    })
    .compileComponents();
  });

  beforeEach((done) => {
    fixture = TestBed.createComponent(AddGameCardsComponent);
    component = fixture.componentInstance;

    ioWebsocketService = TestBed.inject(IoWebsocketService);

    // Update the input planifRoom
    let pr : PlanifRoom = new PlanifRoom(ioWebsocketService, TestBed.inject(ToastrService));
    component.planifRoom = pr;

    pr.init("init", true, () => {
      fixture.detectChanges();
      done();
    })
  });

  it('should create', () => {
    expect(component).toBeTruthy();

  });

  it('should open', (done) => {
    let modalService: BsModalService = (component as any).modalService;
    spyOn(modalService, 'show').and.callThrough();

    let allOpenDiv = fixture.debugElement.queryAll(By.css('#openDiv'));
    allOpenDiv[0].nativeElement.click();

    fixture.detectChanges();

    expect(modalService.show).toHaveBeenCalled();

    // fixture.debugElement.query(By.css('#addButton')); not working ...
    let addBtnDoc = document.querySelectorAll('#addButton');
    expect(addBtnDoc).not.toBeNull('addBtn is not null');
    expect(addBtnDoc[0].getAttribute('disabled')).not.toBeNull('addBtn is disabled');

    let modalReference : BsModalRef = (component as any).modalReference;
    modalReference.onHide.subscribe((/*modalDismissReasons: string*/) => {
      done();
    });

    let modalW = document.querySelectorAll('modal-container');
    expect(modalW.length).toEqual(1, 'find popup in the window');

    let modal = document.querySelectorAll('.modal-content');
    expect(modal.length).toEqual(1, 'find popup');

    let modalBody = document.querySelectorAll('.modal-body');
    expect(modalBody.length).toEqual(1, 'find body popup');

    let allExempleCards = document.querySelectorAll('.modal-body .exampleCard');
    expect(allExempleCards.length).toEqual(3, 'example card at the start');

    expect(component.userCardsGame.length).toEqual(0, 'no user card card');
    expect(fixture.debugElement.queryAll(By.css('.modal-body .exampleCard.selected')).length).toEqual(0, 'one example card selected');

    // modalReference.hide(); not working
    modalService.hide(modalReference.id);
    fixture.detectChanges();
  });

  xit('should reboot the form', (done) => {

    let allOpenDiv = fixture.debugElement.queryAll(By.css('#openDiv'));
    allOpenDiv[0].nativeElement.click();

    fixture.detectChanges();

    let modalReference : BsModalRef = (component as any).modalReference;
    modalReference.onHide.subscribe(
      {
        next : () => {
          allOpenDiv[0].nativeElement.click();
          fixture.detectChanges();

          // modalReference is not working
          let modalReference2 : BsModalRef = (component as any).modalReference;
          modalReference2.onHide.subscribe(
            {
              next : () => {
                expect(component.userCardsGame.length).toEqual(0, 'no user card card');;
                done()
              }
            }
          )

          //valueInput = fixture.debugElement.query(By.css('#cardValue')).nativeElement
          //expect(valueInput.value).toEqual('', 'no value');

          errorMessage = document.querySelectorAll('.modal-body .invalid-feedback');
          expect(errorMessage.length).toEqual(0, 'no error displayed');

          errorBorder = document.querySelectorAll('.modal-body .is-invalid');
          expect(errorBorder.length).toEqual(0, 'no error border displayed');

          modalReference2.hide();
          fixture.detectChanges();
        }
      }
    )

    let valueInput = fixture.debugElement.query(By.css('#cardValue')).nativeElement
    expect(valueInput).not.toBeNull('cardValue is not null');
    valueInput.value = "XXXL";
    valueInput.dispatchEvent(new Event("input"));
   fixture.detectChanges();

    let errorMessage = document.querySelectorAll('.modal-body .invalid-feedback');
    expect(errorMessage.length).toEqual(1, 'error displayed');

    let errorBorder = document.querySelectorAll('.modal-body .is-invalid');
    expect(errorBorder.length).toEqual(1, 'error border displayed');

    // modalReference.hide(); not working
    let modalService: BsModalService = (component as any).modalService;
    modalService.hide(modalReference.id);
    fixture.detectChanges();
  });

  xit('should display error', (done) => {
    let allOpenDiv = fixture.debugElement.queryAll(By.css('#openDiv'));
    allOpenDiv[0].nativeElement.click();
    fixture.detectChanges();

    let modalReference : BsModalRef = (component as any).modalReference;
    modalReference.onHide.subscribe(
      {
        next : () => {
          expect(component.userCardsGame.length).toEqual(0, 'no user card card');;
          done()
        }
      }
    )

    let valueInput = fixture.debugElement.query(By.css('#cardValue')).nativeElement
    valueInput.value = "XXXL";
    valueInput.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    let errorMessage = document.querySelectorAll('.modal-body .invalid-feedback');
    expect(errorMessage.length).toEqual(1, 'error displayed');

    let errorBorder = document.querySelectorAll('.modal-body .is-invalid');
    expect(errorBorder.length).toEqual(1, 'error border displayed');

    let addBtn: DebugElement = fixture.debugElement.query(By.css('#addButton'));
    expect(addBtn.nativeElement.disabled).toEqual(true, 'addBtn is disabled');

    valueInput.value = "XXL";
    valueInput.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    errorMessage = document.querySelectorAll('.modal-body .invalid-feedback');
    expect(errorMessage.length).toEqual(0, 'error not displayed');

    errorBorder = document.querySelectorAll('.modal-body .is-invalid');
    expect(errorBorder.length).toEqual(0, 'error border not displayed');


    valueInput.value = "";
    valueInput.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    errorMessage = document.querySelectorAll('.modal-body .invalid-feedback');
    expect(errorMessage.length).toEqual(0, 'error not displayed 2');

    errorBorder = document.querySelectorAll('.modal-body .is-invalid');
    expect(errorBorder.length).toEqual(0, 'error border not displayed 2');

    modalReference.hide();
    fixture.detectChanges();

  });

  xit('should add card', (done) => {
    let allOpenDiv = fixture.debugElement.queryAll(By.css('#openDiv'));
    allOpenDiv[0].nativeElement.click();
    fixture.detectChanges();

    let modalReference : BsModalRef = (component as any).modalReference;
    modalReference.onHide.subscribe(
      {
        next : () => {
          expect(component.userCardsGame.length).toEqual(0, 'no user card card');;
          done()
        }
      }
    )

    let valueInput = fixture.debugElement.query(By.css('#cardValue')).nativeElement
    valueInput.value = "XXL";
    valueInput.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    let addBtn: DebugElement = fixture.debugElement.query(By.css('#addButton'));
    expect(addBtn.nativeElement.disabled).toEqual(false, 'addBtn OK');
    addBtn.nativeElement.click();
    fixture.detectChanges();

    expect(component.userCardsGame.length).toEqual(1, 'add a card');
    let allExempleCards = document.querySelectorAll('.modal-body .exampleCard');
    expect(allExempleCards.length).toEqual(4, 'example card');
    expect(valueInput.value).toEqual('', 'no value');

    modalReference.hide();
    fixture.detectChanges();

  });

  xit('should send new game', (done) => {
    let allOpenDiv = fixture.debugElement.queryAll(By.css('#openDiv'));
    allOpenDiv[0].nativeElement.click();
    fixture.detectChanges();

    let modalReference : BsModalRef = (component as any).modalReference;
    modalReference.onHide.subscribe(
      {
        next : () => {

          expect(mySpy).toHaveBeenCalledTimes(1);
          expect(pr.sendNewGame.calls.argsFor(0)).toEqual([[
            {value:"XXL", active: true},
            {value:"&#xf128", active: false},
            {value:"&#xf534;", active: false},
            {value:"&#xf0f4;", active: false}
          ]]);
          expect(component.userCardsGame.length).toEqual(0, 'no user card card');
          done();
        }
      }
    )

    let valueInput = fixture.debugElement.query(By.css('#cardValue')).nativeElement
    valueInput.value = "XXL";
    valueInput.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    let addBtn: DebugElement = fixture.debugElement.query(By.css('#addButton'));
    addBtn.nativeElement.click();
    fixture.detectChanges();

    let pr : any = (component as any).planifRoom;
    let mySpy = spyOn(pr, 'sendNewGame').and.callFake(function(cardsGame : Array<any>) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("game_added_and_selected").next({cardsGameName : "name", cardsGame : cardsGame});
    })

    let sendBtn: DebugElement = fixture.debugElement.query(By.css('#sendButton'));
    sendBtn.nativeElement.click();
    fixture.detectChanges();

    // See test in next

  });

  xit('should select card', (done) => {
    let allOpenDiv = fixture.debugElement.queryAll(By.css('#openDiv'));
    allOpenDiv[0].nativeElement.click();
    fixture.detectChanges();

    let modalReference : BsModalRef = (component as any).modalReference;
    modalReference.onHide.subscribe(
      {
        next : () => {

          expect(mySpy).toHaveBeenCalledTimes(1);
          expect(pr.sendNewGame.calls.argsFor(0)).toEqual([[
            {value:"&#xf128", active: false},
            {value:"&#xf534;", active: false},
            {value:"&#xf0f4;", active: true}
          ]]);
          done();
        }
      }
    )

    let allExempleCards = fixture.debugElement.queryAll(By.css('.modal-body .exampleCard'));
    expect(allExempleCards.length).toEqual(3, 'all example card');
    allExempleCards[2].nativeElement.click();
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.modal-body .exampleCard.unselected')).length).toEqual(2, 'one example card unselected less');

    let pr : any = (component as any).planifRoom;
    let mySpy = spyOn(pr, 'sendNewGame').and.callFake(function(cardsGame : Array<any>) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("game_added_and_selected").next({cardsGameName : "name", cardsGame : cardsGame});
    })

    let sendBtn: DebugElement = fixture.debugElement.query(By.css('#sendButton'));
    sendBtn.nativeElement.click();
    fixture.detectChanges();

    // See test in next

  });

  xit('should change card', (done) => {
    component.userCardsGame = [
      {value:"XXS", active: true},
      {value:"XS", active: true},
      {value:"S", active: true}
    ];
    let allOpenDiv = fixture.debugElement.queryAll(By.css('#openDiv'));
    allOpenDiv[0].nativeElement.click();
    fixture.detectChanges();

    let modalReference : BsModalRef = (component as any).modalReference;
    modalReference.onHide.subscribe(
      {
        next : () => {
          done();
        }
      }
    )

    let allExempleCards = fixture.debugElement.queryAll(By.css('.modal-body .exampleCard'));
    expect(allExempleCards.length).toEqual(6, 'all example card');

    component.drop(({previousIndex: 0, currentIndex: 1} as CdkDragDrop<Array<any>>));
    fixture.detectChanges();

    let newExempleCards = fixture.debugElement.queryAll(By.css('.modal-body .exampleCard'));
    expect(newExempleCards.length).toEqual(6, 'all example card');
    expect(newExempleCards[0].nativeElement.innerHTML).toEqual('XS', 'first card');

    modalReference.hide();
    fixture.detectChanges();

  });


  afterEach(() => {
    // detect left-over modals and report errors when found
    const remainingModalWindows = document.querySelectorAll('ngb-modal-window');
    if (remainingModalWindows.length) {
      fail(`${remainingModalWindows.length} modal windows were left in the DOM.`);
    }

    const remainingModalBackdrops = document.querySelectorAll('ngb-modal-backdrop');
    if (remainingModalBackdrops.length) {
      fail(`${remainingModalBackdrops.length} modal backdrops were left in the DOM.`);
    }
  });

});
