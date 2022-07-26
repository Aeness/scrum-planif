import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { PlanifRoom } from '../planif.room/planif.room';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { UsersListComponent } from './users-list.component';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let service;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersListComponent ],
      imports: [ FontAwesomeModule, ToastrModule.forRoot() ],
      providers: [
        {provide: IoWebsocketService, useClass: IoWebsocketMockService} // for PlanifRoom
      ]
    })
    .compileComponents();
  });

  beforeEach((done) => {
    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(IoWebsocketService);
    service.curentUsers = {ref: {ref: "ref", name: "Admin", role: {isAdmin: true, isPlaying: false}}}

    // Update the input planifRoom
    let pr : PlanifRoom = new PlanifRoom(service, TestBed.inject(ToastrService));
    component.planifRoom = pr;

    pr.init("init", true, () => {
      fixture.detectChanges();
      done();
    })
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should add a user', () => {
    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(1);

    service.subjects.get("user_join_planif").next({user: {ref: "ref2", name: "player1", role: {isAdmin: false, isPlaying: false}}});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(2);
    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(2);
  });


  it('should remove a user', () => {
    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(1);

    service.subjects.get("user_leave_planif").next({ user_ref: "ref" });
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(0);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(0);
    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(0);
  });


  it('should add a player', () => {
    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="cog"]')).length).toEqual(0);

    service.subjects.get("user_join_planif").next({user: {ref: "ref2", name: "player1", role: {isAdmin: false, isPlaying: false}, vote: null}});
    service.subjects.get("player_join_planif").next({player: {ref: "ref2", name: "player1"}});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(2);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="cog"]')).length).toEqual(1);
  });


  it('should remove a player', () => {
    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="cog"]')).length).toEqual(0);

    service.subjects.get("user_join_planif").next({user: {ref: "ref2", name: "player1", role: {isAdmin: false, isPlaying: false}}});
    service.subjects.get("player_join_planif").next({player: {ref: "ref2", name: "player1"}});
    fixture.detectChanges();

    service.subjects.get("player_leave_planif").next({player_ref: "ref2"});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(2);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(2);
  });


  it('should hide the result', () => {
    service.subjects.get("user_join_planif").next({user: {ref: "ref2", name: "player1", role: {isAdmin: false, isPlaying: false}}});
    service.subjects.get("player_join_planif").next({player: {ref: "ref2", name: "player1"}});
    fixture.detectChanges();

    service.subjects.get("player_choose").next({ player_ref: "ref2", choosenValue: "5"});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(2);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="cog"]')).length).toEqual(0);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="check"]')).length).toEqual(1);
  });


  it('should show the result', () => {
    service.subjects.get("user_join_planif").next({user: {ref: "ref2", name: "player1", role: {isAdmin: false, isPlaying: false}}});
    service.subjects.get("player_join_planif").next({player: {ref: "ref2", name: "player1"}});
    fixture.detectChanges();

    service.subjects.get("player_choose").next({ player_ref: "ref2", choosenValue: "5"});
    fixture.detectChanges();

    service.subjects.get("results_visibility_changed").next({ choosenVisibility: true});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('tbody>tr')).length).toEqual(2);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="chess-queen"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="eye"]')).length).toEqual(1);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="cog"]')).length).toEqual(0);
    expect(fixture.debugElement.queryAll(By.css('[data-icon="check"]')).length).toEqual(0);
  });
});
