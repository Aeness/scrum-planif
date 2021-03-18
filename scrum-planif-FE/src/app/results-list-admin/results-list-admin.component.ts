import { Component, Input } from '@angular/core';
import { AuthService } from '../auth.service/auth.service';
import { ResultsListComponent } from '../results-list/results-list.component';

@Component({
  selector: 'app-results-list-admin',
  templateUrl: './results-list-admin.component.html',
  styleUrls: ['../card/font-icon.scss']
})
export class ResultsListAdminComponent extends ResultsListComponent {

  @Input() iVoteValue: boolean;
  @Input() resultsVisibilityValue: boolean;

  private meRef : string;

  constructor(
    protected authService: AuthService
  ) {
    super(authService)
    this.meRef = this.authService.userConnected.ref;
  }

  get iVote() : boolean {
    return this.players.has(this.meRef);
  }
}
