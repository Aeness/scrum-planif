import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { PlanifRoom } from '../planif.room/planif.room';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { CardsGameComponent } from './cards-game.component';

describe('CardsGameComponent', () => {
  let component: CardsGameComponent;
  let fixture: ComponentFixture<CardsGameComponent>;
  let ioWebsocketService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ToastrModule.forRoot() ],
      declarations: [ CardsGameComponent ],
      providers: [
        ToastrService, // for PlanifRoom
        {provide: IoWebsocketService, useClass: IoWebsocketMockService} // for PlanifRoom
      ]
    })
    .compileComponents();
  });

  beforeEach((done) => {
    fixture = TestBed.createComponent(CardsGameComponent);
    component = fixture.componentInstance;

    ioWebsocketService = TestBed.inject(IoWebsocketService);

    // Update the input myGameTypeName
    component.myGameTypeName = "classic"

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

  it('should change the cards in the game', () => {
    let allExempleCards = fixture.debugElement.queryAll(By.css('.exampleCard'));

    let pr : any = (component as any).planifRoom;
    pr.currentGameName = "classic";
    let mySpy = spyOn(pr, 'sendCardVisibility').and.callFake(function(cardIndex: number, choosenVisibility : boolean) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("card_visibility_changed").next({cardIndex : cardIndex, choosenVisibility : choosenVisibility});
    })

    expect(allExempleCards.length).toEqual(14, 'all example card');

    allExempleCards[1].nativeElement.click();
    fixture.detectChanges();

    // <=> expect(pr.sendCardVisibility.calls.count()).toEqual(1);
    expect(mySpy).toHaveBeenCalledTimes(1);
    expect(pr.sendCardVisibility.calls.argsFor(0)).toEqual([1, false]);
    expect(fixture.debugElement.queryAll(By.css('.exampleCard.selected')).length).toEqual(13, 'one example card less');

    allExempleCards[5].nativeElement.click();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(1+1);
    expect(pr.sendCardVisibility.calls.argsFor(1)).toEqual([5, false]);
    expect(fixture.debugElement.queryAll(By.css('.exampleCard.selected')).length).toEqual(12, 'two example cards less');


    allExempleCards[1].nativeElement.click();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(2+1);
    expect(pr.sendCardVisibility.calls.argsFor(2)).toEqual([1, true]);
    expect(fixture.debugElement.queryAll(By.css('.exampleCard.selected')).length).toEqual(13, 'one card less - 2');
  });

  it('should not change the cards in the game', () => {
    let allExempleCards = fixture.debugElement.queryAll(By.css('.exampleCard'));

    let pr : any = (component as any).planifRoom;
    pr.currentGameName = "other";
    let mySpy = spyOn(pr, 'sendCardVisibility').and.callFake(function(cardIndex: number, choosenVisibility : boolean) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("card_visibility_changed").next({cardIndex : cardIndex, choosenVisibility : choosenVisibility});
    })

    expect(allExempleCards.length).toEqual(14, 'all example card');

    allExempleCards[1].nativeElement.click();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(0);
  });
});
