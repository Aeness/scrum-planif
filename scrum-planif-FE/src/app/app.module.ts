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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LogoutComponent } from './logout/logout.component';
import { PlanifAdminComponent } from './planif-admin.page/planif-admin.component';
import { HandComponent } from './hand/hand.component';
import { PlayersListComponent } from './players-list/players-list.component';
import { ChooseCardsGameComponent } from './choose-cards-game/choose-cards-game.component';
import { CardsGameComponent } from './cards-game/cards-game.component';
import { DescriptionComponent } from './description/description.component';
import { UsersListComponent } from './users-list/users-list.component';
import { ToastContainerModule, ToastrModule } from 'ngx-toastr';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddGameCardsComponent } from './add-game-cards.modal/add-game-cards.component';

const appRoutes: Routes = [
  {
    path: '',
    component: IndexComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Se connecter' }
  },
  {
    path: 'logout',
    component: LogoutComponent
  },
  {
    path: 'planif/:planif_ref',
    component: PlanifComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'planif/:planif_ref/admin',
    component: PlanifAdminComponent,
    canActivate: [AuthGuard]
  },
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LogoutComponent,
    IndexComponent,
    CardComponent,
    PlanifComponent,
    PlanifAdminComponent,
    HandComponent,
    PlayersListComponent,
    ChooseCardsGameComponent,
    CardsGameComponent,
    DescriptionComponent,
    UsersListComponent,
    AddGameCardsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: environment.routerEnableTracing, relativeLinkResolution: 'legacy' } // <-- debugging purposes only
    ),
    ReactiveFormsModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'inline-right',

    }),
    ToastContainerModule,
    NgbModule
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
