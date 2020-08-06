import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { IndexComponent } from './index.page/index.component';
import { CardComponent } from './card/card.component';
import { PlanifComponent } from './planif.page/planif.component';



const appRoutes: Routes = [
  {
    path: '',
    component: IndexComponent
  },
  {
    path: 'planif',
    component: PlanifComponent
  },
]

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    CardComponent,
    PlanifComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: environment.routerEnableTracing } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
