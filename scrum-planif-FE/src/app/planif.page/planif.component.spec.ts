import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthServiceMock } from '../auth.service/auth.mock.service';
import { AuthService } from '../auth.service/auth.service';
import { PlanifRoom } from '../planif.room/planif.room';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';

import { PlanifComponent } from './planif.component';

describe('PlanifComponent', () => {
  let component: PlanifComponent;
  let fixture: ComponentFixture<PlanifComponent>;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [ PlanifComponent ],
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

    expect((component as any).planifRoom instanceof PlanifRoom).toBeTruthy('planifRoom is not mocked');
    expect(((component as any).planifRoom as any).ioWebsocketService instanceof IoWebsocketMockService).toBeTruthy('ioWebsocketService is mocked');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
