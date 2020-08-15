import { Component } from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html'
})
export class IndexComponent {
  ref_link = Math.random().toString(36).substr(2, 9);
}
