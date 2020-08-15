import { Component } from '@angular/core';
import { Player } from './auth.service/player';
import { AuthService } from './auth.service/auth.service';
import { Subscription } from 'rxjs';
import { StorageTokenTool } from './auth.service/storage-token.tool';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'scrum-planif';
  player : Player ;
  subscription: Subscription;

  constructor(private authService: AuthService) {
    this.subscription = authService.playerAnnounced$.subscribe(
      (player : Player) => {
        this.player = player;
      }
    );

    if (authService.hasPlayerConnected) {
      this.player = authService.playerConnected;
    }
  }

  get userConnected() : boolean {
    return this.player != null;
  }
}
