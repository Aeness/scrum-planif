import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthServiceMock } from '../auth.service/auth.mock.service';
import { AuthService } from '../auth.service/auth.service';
import { PlanifRoom } from '../planif.room/planif.room';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { PlayersListComponent } from './players-list.component';

describe('PlayersListComponent', () => {
  let component: PlayersListComponent;
  let fixture: ComponentFixture<PlayersListComponent>;
  let service;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayersListComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule, FontAwesomeModule],
      providers: [
        {provide: AuthService, useValue: new AuthServiceMock({ref: "ref", name: "Toto"})}, // for the template
        {provide: IoWebsocketService, useClass: IoWebsocketMockService} // for PlanifRoom
      ]
    })
    .compileComponents();
  });

  // done : https://jasmine.github.io/tutorials/async#callbacks
  beforeEach((done) => {
    fixture = TestBed.createComponent(PlayersListComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(IoWebsocketService);

    // Update the input planifRoom
    let pr : PlanifRoom = new PlanifRoom(service);
    component.planifRoom = pr;

    pr.init("init", () => {
      fixture.detectChanges();
      done();
    })

  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayersListComponent);
    let component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
