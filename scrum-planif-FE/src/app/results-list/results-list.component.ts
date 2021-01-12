import { Component } from '@angular/core';
import { PlayersListComponent } from '../players-list/players-list.component';

@Component({
  selector: 'app-results-list',
  templateUrl: 'results-list.component.html',
  styleUrls: ['../card/font-icon.scss']
})
export class ResultsListComponent extends PlayersListComponent { }
