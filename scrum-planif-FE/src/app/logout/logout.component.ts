import { Component } from '@angular/core';
import { StorageTokenTool } from '../auth.service/storage-token.tool';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service/auth.service';

@Component({
  template: ''
})
export class LogoutComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {

    StorageTokenTool.deleteTokens();
    this.authService.revokeUser();
    this.router.navigate(['/'])
  }
}
