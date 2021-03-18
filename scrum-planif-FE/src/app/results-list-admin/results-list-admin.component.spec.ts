import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthServiceMock } from '../auth.service/auth.mock.service';
import { AuthService } from '../auth.service/auth.service';
import { PlanifRoom } from '../planif.room/planif.room';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { ResultsListAdminComponent } from './results-list-admin.component';

describe('ResultsListAdminComponent', () => {
  let component: ResultsListAdminComponent;
  let fixture: ComponentFixture<ResultsListAdminComponent>;
  let service: IoWebsocketService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultsListAdminComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        {provide: AuthService, useValue: new AuthServiceMock({ref: "ref2", name: "Admin"})},
        {provide: IoWebsocketService, useClass: IoWebsocketMockService} // for PlanifRoom
      ]
    })
    .compileComponents();
  });

  // done : https://jasmine.github.io/tutorials/async#callbacks
  beforeEach((done) => {
    fixture = TestBed.createComponent(ResultsListAdminComponent);
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
    expect(component).toBeTruthy();
  });
});
