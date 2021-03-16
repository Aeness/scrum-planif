import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthServiceMock } from '../auth.service/auth.mock.service';
import { AuthService } from '../auth.service/auth.service';
import { PlanifRoom } from '../planif.room/planif.room';
import { PlayersListComponent } from '../players-list/players-list.component';
import { ResultsListComponent } from '../results-list/results-list.component';
import { HandComponent } from '../hand/hand.component';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { PlanifComponent } from './planif.component';

describe('PlanifComponent', () => {
  let component: PlanifComponent;
  let fixture: ComponentFixture<PlanifComponent>;
  let planifRoom : PlanifRoom;
  let service;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [
        PlanifComponent,
        PlayersListComponent,
        HandComponent,
        ResultsListComponent
      ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
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
    fixture = TestBed.createComponent(PlanifComponent);
    component = fixture.componentInstance;

    planifRoom = (component as any).planifRoom;
    expect(planifRoom instanceof PlanifRoom).toBeTruthy('planifRoom is not mocked');
    service = ((component as any).planifRoom as any).ioWebsocketService;
    expect(service instanceof IoWebsocketMockService).toBeTruthy('ioWebsocketService is mocked');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have cards but not result', () => {
    expect(fixture.debugElement.queryAll(By.css('app-players')).length).toEqual(1, 'one app-players');
    expect(fixture.debugElement.queryAll(By.css('app-hand')).length).toEqual(1, 'one app-hand');
    expect(fixture.debugElement.queryAll(By.css('app-results-list'))).toEqual([], 'zero app-results-list');



  });

  it('should have cards and result', () => {
    // Change values by IoWebsocketMockService
    service.subjects.get("results_visibility_changed").next({choosenVisibility : true});

    // Change values by PlanifRoom : enough ?
    //planifRoom.resultsVisibility$.next(true);

    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-players')).length).toEqual(1, 'one app-players');
    expect(fixture.debugElement.queryAll(By.css('app-hand')).length).toEqual(1, 'one app-hand');
    expect(fixture.debugElement.queryAll(By.css('app-results-list')).length).toEqual(1, 'zero app-results-list');



  });

  it('should changed the subject', () => {

    expect(fixture.debugElement.query(By.css('.subject')).nativeElement.textContent).toEqual('', 'title before');

    // Change values by PlanifRoom : enough ?
    planifRoom.subject$.next("New");
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.subject')).nativeElement.textContent).toEqual('New', 'title change');
  });

});
