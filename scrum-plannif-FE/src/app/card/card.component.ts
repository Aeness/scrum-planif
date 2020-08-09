import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() value: Number;
  private isSelected: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  click() {
    this.isSelected = !this.isSelected;
  }
}
