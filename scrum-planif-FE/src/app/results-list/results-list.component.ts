import { Component } from '@angular/core';
import { PlayersListComponent } from '../players-list/players-list.component';

@Component({
  selector: 'app-results-list',
  templateUrl: 'results-list.component.html'
})
export class ResultsListComponent extends PlayersListComponent { }
