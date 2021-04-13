import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthServiceMock } from '../auth.service/auth.mock.service';
import { AuthService } from '../auth.service/auth.service';
import { PlanifRoom } from '../planif.room/planif.room';
import { PlayersListComponent } from '../players-list/players-list.component';
import { HandComponent } from '../hand/hand.component';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { PlanifComponent } from './planif.component';
import { FormBuilder } from '@angular/forms';
import { CardComponent } from '../card/card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DescriptionComponent } from '../description/description.component';
import { UsersListComponent } from '../users-list/users-list.component';

describe('PlanifComponent', () => {
  let component: PlanifComponent;
  let fixture: ComponentFixture<PlanifComponent>;
  let planifRoom : PlanifRoom;
  let service;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [
        PlanifComponent,
        DescriptionComponent,
        PlayersListComponent,
        HandComponent,
        CardComponent,
        UsersListComponent
      ],
      imports: [RouterTestingModule, HttpClientTestingModule, FontAwesomeModule],
      providers: [
        FormBuilder, // For HandComponent
        {provide: AuthService, useValue: new AuthServiceMock({ref: "ref", name: "Toto"})}
      ]
    })
    // https://angular.io/guide/testing-components-scenarios#override-component-providers
    .overrideComponent(
      PlanifComponent,
      {set: {providers: [
        {provide: IoWebsocketService, useClass: IoWebsocketMockService},
        PlanifRoom
      ]}}
    )
    .compileComponents();
  });

  beforeEach(() => {
    // Call planifRoom.init and 'ask_planif_informations
    fixture = TestBed.createComponent(PlanifComponent);
    component = fixture.componentInstance;

    planifRoom = (component as any).planifRoom;
    expect(planifRoom instanceof PlanifRoom).toBeTruthy('planifRoom is not mocked');
    service = ((component as any).planifRoom as any).ioWebsocketService;
    expect(service instanceof IoWebsocketMockService).toBeTruthy('ioWebsocketService is mocked');

    service.subjects.get("user_join_planif").next({user: {ref: "ref", name: "Toto", vote: null, role: {isAdmin: false, isPlaying: false}}});
    service.subjects.get("player_join_planif").next({player: {ref: "ref", name: "Toto", vote: null}});

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(fixture.debugElement.queryAll(By.css('app-players')).length).toEqual(1, 'one app-players');
    expect(fixture.debugElement.queryAll(By.css('app-hand')).length).toEqual(1, 'one app-hand');
    expect(fixture.debugElement.queryAll(By.css('app-users-list')).length).toEqual(1, 'one app-users-list');
  });

  it('should not show result', () => {
    expect(fixture.debugElement.queryAll(By.css('app-users-list tbody>tr')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="cog"]')).length).toEqual(1);


    service.subjects.get("player_choose").next({ player_ref: "ref", choosenValue: "5"});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-users-list tbody>tr')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="cog"]')).length).toEqual(0);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="check"]')).length).toEqual(1);

  });

  it('should not show result', () => {
    expect(fixture.debugElement.queryAll(By.css('app-users-list tbody>tr')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="cog"]')).length).toEqual(1);


    // Change values by IoWebsocketMockService
    service.subjects.get("player_choose").next({ player_ref: "ref", choosenValue: "5"});
    service.subjects.get("results_visibility_changed").next({choosenVisibility : true});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-users-list tbody>tr')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="cog"]')).length).toEqual(0);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="check"]')).length).toEqual(0);
  });

  it('should changed the subject', () => {

    expect(fixture.debugElement.query(By.css('.subject')).nativeElement.textContent).toEqual('', 'title before');

    // Change values by PlanifRoom : enough ?
    planifRoom.subject$.next("New");
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.subject')).nativeElement.textContent).toEqual('New', 'title change');
  });

});
