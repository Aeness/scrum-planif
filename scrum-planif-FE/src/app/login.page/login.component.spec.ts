import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../auth.service/auth.service';

import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { LoginComponent } from './login.component';
import { DebugElement } from '@angular/core';
import { throwError } from 'rxjs'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService, toastrService;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
    declarations: [LoginComponent],
    imports: [RouterTestingModule, ReactiveFormsModule, BrowserAnimationsModule, ToastrModule.forRoot()],
    providers: [UntypedFormBuilder, ToastrService, AuthService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    toastrService = TestBed.inject(ToastrService);
    fixture.detectChanges();
  });

  it('should be desactivate', () => {
    expect(component).toBeTruthy();

    spyOn(fixture.componentInstance, 'onSubmit');
    let loginBtn: DebugElement = fixture.debugElement.query(By.css('#commitbtn'));
    loginBtn.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.onSubmit).toHaveBeenCalledTimes(0);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    let nameInput = fixture.debugElement.query(By.css('#name')).nativeElement
    nameInput.value = "ooo";
    nameInput.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    spyOn(fixture.componentInstance, 'onSubmit').and.callThrough();
    spyOn(authService, 'start').and.callThrough();

    let loginBtn: DebugElement = fixture.debugElement.query(By.css('#commitbtn'));
    loginBtn.nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.onSubmit).toHaveBeenCalled();
    expect(authService.start).toHaveBeenCalledTimes(1);
  });

  it('should display a 429 message', () => {
    expect(component).toBeTruthy();
    let nameInput = fixture.debugElement.query(By.css('#name')).nativeElement
    nameInput.value = "ooo";
    nameInput.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    spyOn(authService, 'start').and.returnValue(throwError({status: 429}));
    spyOn(toastrService, 'error').and.callThrough();

    let loginBtn: DebugElement = fixture.debugElement.query(By.css('#commitbtn'));
    loginBtn.nativeElement.click();
    fixture.detectChanges();

    expect(toastrService.error).toHaveBeenCalled();
    expect(toastrService.error.calls.argsFor(0)).toEqual([null, 'Il y a eu trop d\'essais. Veuillez réessayer dans 5 minutes.',{  disableTimeOut: true }]);
  });

});
