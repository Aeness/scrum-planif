import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../auth.service/auth.service';
import { PlanifRoom } from '../planif.room/planif.room';

import { PlanifComponent } from './planif.component';

describe('PlanifComponent', () => {
  let component: PlanifComponent;
  let fixture: ComponentFixture<PlanifComponent>;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [ PlanifComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [AuthService, PlanifRoom]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
