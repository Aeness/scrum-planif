import { RouterTestingModule } from "@angular/router/testing";
import { provideHttpClientTesting } from "@angular/common/http/testing";

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './auth.service/auth.service';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe('AppComponent', () => {
  beforeEach(async() => {
    await TestBed.configureTestingModule({
    declarations: [
        AppComponent
    ],
    imports: [RouterTestingModule, FontAwesomeModule, ToastrModule.forRoot()],
    providers: [ToastrService, AuthService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  });

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

  it('userConnected', () => {
    const fixture : ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);
    let component = fixture.componentInstance;

    (component as any).authService.userConnectedSource.next({ref: "userref", name: "Toto"});

    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app.userConnected).toEqual(true);
  });

});
