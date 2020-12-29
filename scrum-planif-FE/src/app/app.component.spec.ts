import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './auth.service/auth.service';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, FontAwesomeModule],
      declarations: [
        AppComponent
      ],
      providers: [AuthService],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('userNotConnected', () => {
    const fixture : ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app.userConnected).toEqual(false);
  });

  it(`should have as title 'scrum-planif'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('scrum-planif');
  });

  /*it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to scrum-planif!');
  });*/

  it('userConnected', () => {
    const fixture : ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);
    let component = fixture.componentInstance;

    (component as any).authService.userConnectedSource.next({ref: "userref", name: "Toto"});

    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app.userConnected).toEqual(true);
  });

});
