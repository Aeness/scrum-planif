import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../auth.service/auth.service';
import { User } from '../auth.service/user';
import { PlanifRoom } from '../planif.room/planif.room';

import { PlayersListComponent } from './players-list.component';

describe('PlayersListComponent', () => {
  let component: PlayersListComponent;
  let fixture: ComponentFixture<PlayersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayersListComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{provide: AuthService, useValue: new AuthServiceMock()}]
    })
    .compileComponents();
  });

  // done : https://jasmine.github.io/tutorials/async#callbacks
  beforeEach((done) => {
    fixture = TestBed.createComponent(PlayersListComponent);
    component = fixture.componentInstance;

    // Update the input planifRoom
    var pr : PlanifRoom = new PlanifRoom();
    component.planifRoom = pr;
    pr.init("init", {ref: "ref", name: "Toto"}, () => {
      fixture.detectChanges();
      done();
    })

  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlayersListComponent);
    let component = fixture.componentInstance;

    //expect((component as any).authService.userConnected).toEqual(true);
    expect(component).toBeTruthy();
  });
});

class AuthServiceMock extends AuthService {

  constructor() {
    super(null);
  }

  get userConnected() : User {
    return {ref: "ref", name: "Toto"};
  }

}
