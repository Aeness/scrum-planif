import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./font-icon.scss', './card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() value: string;
  @Input() rank: string;
  @Input() isDesactived: boolean = false;
  @Output() choosenEvent = new EventEmitter<boolean>();
  public isSelected: boolean = false;

  ngOnInit() {
  }

  click() {
    if (!this.isDesactived) {
      this.isSelected = !this.isSelected;
      this.choosenEvent.emit(this.isSelected);
    }
  }

  public unselectedIfNot(choosenValue : string) {
    if (this.value != choosenValue) {
      this.isSelected = false;
    }
  }
}
