import { Component, Input, OnInit } from '@angular/core';
import { ResultsListComponent } from '../results-list/results-list.component';

@Component({
  selector: 'app-results-list-admin',
  templateUrl: './results-list-admin.component.html',
  styleUrls: ['../card/font-icon.scss']
})
export class ResultsListAdminComponent extends ResultsListComponent {

  @Input() iVoteValue: Boolean;
  @Input() resultsVisibilityValue: Boolean;
}
