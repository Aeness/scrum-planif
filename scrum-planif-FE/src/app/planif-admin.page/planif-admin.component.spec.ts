import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthServiceMock } from '../auth.service/auth.mock.service';
import { AuthService } from '../auth.service/auth.service';
import { PlanifRoom } from '../planif.room/planif.room';
import { HandComponent } from '../hand/hand.component';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { PlanifAdminComponent } from './planif-admin.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../card/card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChooseCardsGameComponent } from '../choose-cards-game/choose-cards-game.component';
import { CardsGameComponent } from '../cards-game/cards-game.component';
import { DescriptionComponent } from '../description/description.component';
import { UsersListComponent } from '../users-list/users-list.component';
import { PlayersListComponent } from '../players-list/players-list.component';
import { ToastrModule } from 'ngx-toastr';

describe('PlanifAdminComponent', () => {
  let component: PlanifAdminComponent;
  let fixture: ComponentFixture<PlanifAdminComponent>;
  let planifRoom : PlanifRoom;
  let service;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [
        PlanifAdminComponent,
        DescriptionComponent,
        ChooseCardsGameComponent,
        CardsGameComponent,
        PlayersListComponent,
        HandComponent,
        CardComponent,
        UsersListComponent
      ],
      imports: [RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule, FormsModule, FontAwesomeModule, ToastrModule.forRoot()],
      providers: [
        FormBuilder,
        {provide: AuthService, useValue: new AuthServiceMock({ref: "ref", name: "Admin"})} // For PlayersListComponent
      ]
    })
    // https://angular.io/guide/testing-components-scenarios#override-component-providers
    .overrideComponent(
      PlanifAdminComponent,
      {set: {providers: [
        {provide: IoWebsocketService, useClass: IoWebsocketMockService},
        PlanifRoom
      ]}}
    )
    .compileComponents();
  });

  beforeEach(() => {
    // Call planifRoom.init and 'ask_planif_informations
    fixture = TestBed.createComponent(PlanifAdminComponent);
    component = fixture.componentInstance;

    planifRoom = (component as any).planifRoom;
    expect(planifRoom instanceof PlanifRoom).toBeTruthy('planifRoom is not mocked');
    service = ((component as any).planifRoom as any).ioWebsocketService;
    expect(service instanceof IoWebsocketMockService).toBeTruthy('ioWebsocketService is mocked');

    service.subjects.get("user_join_planif").next({user: {ref: "ref", name: "Admin", vote: null, role: {isAdmin: true, isPlaying: false}}});

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all components and cards', fakeAsync(() => {
    expect(fixture.debugElement.queryAll(By.css('app-players')).length).toEqual(1, 'one app-players');
    expect(fixture.debugElement.queryAll(By.css('app-hand')).length).toEqual(1, 'one app-hand');
    expect(fixture.debugElement.queryAll(By.css('app-users-list')).length).toEqual(1, 'one app-users-list');
    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(14);
  }));

  it('remove a card of the game should change the game hand', () => {
    let allExempleCards = fixture.debugElement.queryAll(By.css('.exampleCard'));

    let pr : any = (component as any).planifRoom;
    let mySpy = spyOn(pr, 'sendCardVisibility').and.callFake(function(cardIndex: number, choosenVisibility : boolean) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("card_visibility_changed").next({cardIndex : cardIndex, choosenVisibility : choosenVisibility});
    })

    expect(allExempleCards.length).toEqual(8+14, 'all example card');
    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(14);


    allExempleCards[8+1].nativeElement.click();
    fixture.detectChanges();

    // <=> expect(pr.sendCardVisibility.calls.count()).toEqual(1);
    expect(mySpy).toHaveBeenCalledTimes(1);
    expect(pr.sendCardVisibility.calls.argsFor(0)).toEqual([1, false]);
    expect(fixture.debugElement.queryAll(By.css('.exampleCard.selected')).length).toEqual(8+13, 'one example card less');
    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(13);

    allExempleCards[8+5].nativeElement.click();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(1+1);
    expect(pr.sendCardVisibility.calls.argsFor(1)).toEqual([5, false]);
    expect(fixture.debugElement.queryAll(By.css('.exampleCard.selected')).length).toEqual(8+12, 'two example cards less');
    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(12);


    allExempleCards[8+1].nativeElement.click();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(2+1);
    expect(pr.sendCardVisibility.calls.argsFor(2)).toEqual([1, true]);
    expect(fixture.debugElement.queryAll(By.css('.exampleCard.selected')).length).toEqual(8+13, 'one card less - 2');
    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(13, 'one app-card');
  });

  it('change the game should change the game hand', () => {
    let allGameCards = fixture.debugElement.queryAll(By.css('app-cards-game'));
    expect(allGameCards.length).toEqual(2);

    let classicCard = fixture.debugElement.queryAll(By.css('.selected .exampleCard.selected'))
    expect(classicCard.length).toEqual(14);

    let pr : any = (component as any).planifRoom;
    let mySpy = spyOn(pr, 'sendTypeGame').and.callFake(function(gameName : string) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("game_type_changed").next({ cardsGameName: gameName});
    });

    allGameCards[0].nativeElement.click();
    fixture.detectChanges();

    // <=> expect(pr.sendTypeGame.calls.count()).toEqual(1);
    expect(mySpy).toHaveBeenCalledTimes(1);
    expect(pr.sendTypeGame.calls.argsFor(0)).toEqual(["TS"]);
    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(8);
  });

  it('change the results visibility should change the users list', () => {
    service.subjects.get("user_join_planif").next({user: {ref: "ref2", name: "Player", vote: null, role: {isAdmin: true, isPlaying: true}}});
    service.subjects.get("player_join_planif").next({player: {ref: "ref2", name: "Player", vote: null}});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-users-list tbody>tr')).length).toEqual(2);
    expect(fixture.debugElement.queryAll(By.css('app-users-list [data-icon="eye"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('app-users-list [data-icon="cog"]')).length).toEqual(1);

    let pr : any = (component as any).planifRoom;
    let mySpy = spyOn(pr, 'sendResultsVisibility').and.callFake(function(choosenValue : boolean) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("results_visibility_changed").next({choosenVisibility : choosenValue});
    })

    fixture.debugElement.queryAll(By.css('#visibilityChangeTrue'))[0].nativeElement.click();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(1);
    expect(pr.sendResultsVisibility.calls.argsFor(0)).toEqual([true]);

    expect(fixture.debugElement.queryAll(By.css('app-users-list tbody>tr')).length).toEqual(2);
    expect(fixture.debugElement.queryAll(By.css('app-users-list [data-icon="eye"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('app-users-list [data-icon="cog"]')).length).toEqual(0);
  });

  it('should ask for a player', () => {

    expect(fixture.debugElement.queryAll(By.css('.alert-warning')).length).toEqual(0);

    service.subjects.get("user_join_planif").next({user: {ref: "admin2", name: "ScrumMaster", vote: null, role: {isAdmin: true, isPlaying: false}}});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.alert-warning')).length).toEqual(1);


    service.subjects.get("user_leave_planif").next({ user_ref: "ref" });
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.alert-warning')).length).toEqual(0);
  });
});
