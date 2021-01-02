import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthServiceMock } from '../auth.service/auth.mock.service';
import { AuthService } from '../auth.service/auth.service';
import { PlanifRoom } from '../planif.room/planif.room';

import { ResultsListAdminComponent } from './results-list-admin.component';

describe('ResultsListAdminComponent', () => {
  let component: ResultsListAdminComponent;
  let fixture: ComponentFixture<ResultsListAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultsListAdminComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{provide: AuthService, useValue: new AuthServiceMock({ref: "ref", name: "Toto"})}]
    })
    .compileComponents();
  });

  // done : https://jasmine.github.io/tutorials/async#callbacks
  beforeEach((done) => {
    fixture = TestBed.createComponent(ResultsListAdminComponent);
    component = fixture.componentInstance;

    // Update the input planifRoom
    var pr : PlanifRoom = new PlanifRoom();
    component.planifRoom = pr;

    var authService : AuthService = (component as any).authService
    pr.init("init", authService.userConnected, () => {
      fixture.detectChanges();
      done();
    })
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
