import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./font-icon.scss', './card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() value: string;
  @Input() rank: string;
  @Output() choosenEvent = new EventEmitter<Boolean>();
  public isSelected: Boolean = false;

  ngOnInit() {
  }

  click() {
    this.isSelected = !this.isSelected;
    this.choosenEvent.emit(this.isSelected);
    console.log("click")
  }

  public unselectedIfNot(choosenValue : string) {
    if (this.value != choosenValue) {
      this.isSelected = false;
    }
  }
}
