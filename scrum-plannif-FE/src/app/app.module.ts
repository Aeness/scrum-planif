import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { IndexComponent } from './index.page/index.component';
import { CardComponent } from './card/card.component';
import { PlanifComponent } from './planif.page/planif.component';
import { AuthService } from './auth.service/auth.service';
import { HttpClientModule } from '@angular/common/http';
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
    component: PlanifComponent
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
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
