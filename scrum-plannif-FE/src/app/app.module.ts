import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { IndexComponent } from './index.page/index.component';
import { CardComponent } from './card/card.component';
import { PlanifComponent } from './planif.page/planif.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './_interceptors/auth.interceptor';
import { AuthGuard } from './_guards/auth.guard';
import { AuthService } from './auth.service/auth.service';
import { LoginComponent } from './login.page/login.component';
import { ReactiveFormsModule } from '@angular/forms';



const appRoutes: Routes = [
  {
    path: '',
    component: IndexComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Se connecter' }
  },
  {
    path: 'planif',
    component: PlanifComponent,
    canActivate: [AuthGuard]
  },
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    IndexComponent,
    CardComponent,
    PlanifComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: environment.routerEnableTracing } // <-- debugging purposes only
    ),
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    AuthGuard,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
