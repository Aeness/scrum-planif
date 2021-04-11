import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CardsGameComponent } from '../cards-game/cards-game.component';
import { PlanifRoom } from '../planif.room/planif.room';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { ChooseCardsGameComponent } from './choose-cards-game.component';

describe('ChooseCardsComponent', () => {
  let component: ChooseCardsGameComponent;
  let fixture: ComponentFixture<ChooseCardsGameComponent>;
  let service;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseCardsGameComponent, CardsGameComponent ],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        {provide: IoWebsocketService, useClass: IoWebsocketMockService} // for PlanifRoom
      ]
    })
    .compileComponents();
  });

  beforeEach((done) => {
    fixture = TestBed.createComponent(ChooseCardsGameComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(IoWebsocketService);

    // Update the input planifRoom
    let pr : PlanifRoom = new PlanifRoom(service);
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
    let mySpy = spyOn(pr, 'sendCardVisibility').and.callFake(function(cardIndex: number, choosenVisibility : boolean) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("card_visibility_changed").next({cardIndex : cardIndex, choosenVisibility : choosenVisibility});
    })

    expect(allExempleCards.length).toEqual(8+14, 'all example card');

    allExempleCards[8+1].nativeElement.click();
    fixture.detectChanges();

    // <=> expect(pr.sendCardVisibility.calls.count()).toEqual(1);
    expect(mySpy).toHaveBeenCalledTimes(1);
    expect(pr.sendCardVisibility.calls.argsFor(0)).toEqual([1, false]);
    expect(fixture.debugElement.queryAll(By.css('.exampleCard.selected')).length).toEqual(8+13, 'one example card less');

    allExempleCards[8+5].nativeElement.click();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(1+1);
    expect(pr.sendCardVisibility.calls.argsFor(1)).toEqual([5, false]);
    expect(fixture.debugElement.queryAll(By.css('.exampleCard.selected')).length).toEqual(8+12, 'two example cards less');


    allExempleCards[8+1].nativeElement.click();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(2+1);
    expect(pr.sendCardVisibility.calls.argsFor(2)).toEqual([1, true]);
    expect(fixture.debugElement.queryAll(By.css('.exampleCard.selected')).length).toEqual(8+13, 'one card less - 2');
  });

  it('should change the cards game', () => {
    let allGameCards = fixture.debugElement.queryAll(By.css('app-cards-game'));
    expect(allGameCards.length).toEqual(2);

    expect(fixture.debugElement.queryAll(By.css('.selected .exampleCard.selected')).length).toEqual(14);


    let pr : any = (component as any).planifRoom;
    let mySpy = spyOn(pr, 'sendTypeGame').and.callFake(function(gameName : string) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("game_type_changed").next({ cardsGameName: gameName});
    })

    allGameCards[0].nativeElement.click();
    fixture.detectChanges();

    // <=> expect(pr.sendTypeGame.calls.count()).toEqual(1);
    expect(mySpy).toHaveBeenCalledTimes(1);
    expect(pr.sendTypeGame.calls.argsFor(0)).toEqual(["TS"]);
    expect(fixture.debugElement.queryAll(By.css('.selected .exampleCard.selected')).length).toEqual(8);
  });

  it('change the game keep selected card', () => {
    let allGameCards = fixture.debugElement.queryAll(By.css('app-cards-game'));
    expect(allGameCards.length).toEqual(2);

    let classicCard = fixture.debugElement.queryAll(By.css('.selected .exampleCard.selected'))
    expect(classicCard.length).toEqual(14);

    let pr : any = (component as any).planifRoom;

    spyOn(pr, 'sendCardVisibility').and.callFake(function(cardIndex: number, choosenVisibility : boolean) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("card_visibility_changed").next({cardIndex : cardIndex, choosenVisibility : choosenVisibility});
    })
    classicCard[2].nativeElement.click();
    fixture.detectChanges();


    let mySpy = spyOn(pr, 'sendTypeGame').and.callFake(function(gameName : string) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("game_type_changed").next({ cardsGameName: gameName});
    })

    allGameCards[0].nativeElement.click();
    fixture.detectChanges();

    allGameCards[1].nativeElement.click();
    fixture.detectChanges();

    // <=> expect(pr.sendTypeGame.calls.count()).toEqual(1);
    expect(mySpy).toHaveBeenCalledTimes(2);
    expect(fixture.debugElement.queryAll(By.css('.selected .exampleCard.selected')).length).toEqual(14-1);
  });

  it('change the cards game should change the form', () => {
    let allGameCards = fixture.debugElement.queryAll(By.css('app-cards-game'));
    expect(allGameCards.length).toEqual(2);

    expect(fixture.debugElement.queryAll(By.css('.selected .exampleCard.selected')).length).toEqual(14);


    let pr : any = (component as any).planifRoom;
    let mySpy = spyOn(pr, 'sendTypeGame').and.callFake(function(gameName : string) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("game_type_changed").next({ cardsGameName: gameName});
    })

    allGameCards[0].nativeElement.click();
    fixture.detectChanges();

    // <=> expect(pr.sendTypeGame.calls.count()).toEqual(1);
    expect(mySpy).toHaveBeenCalledTimes(1);
    expect(pr.sendTypeGame.calls.argsFor(0)).toEqual(["TS"]);
    expect(component.gameTypeForm.get("gameName").value).toEqual("TS");
  });
});
