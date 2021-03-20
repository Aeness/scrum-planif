import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./font-icon.scss', './card.component.scss']
})
export class CardComponent {
  @Input() value: string;
  @Input() rank: string;
  @Input() isDesactived: boolean = false;
  @Output() choosenEvent = new EventEmitter<boolean>();
  public isSelected: boolean = false;

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

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      //console.log(`[ngOnChanges]${propName}: currentValue = ${JSON.stringify(chng.currentValue)}, previousValue = ${JSON.stringify(chng.previousValue)}`);
      let chng = changes[propName];
      if (propName == "isDesactived") {
        if (chng.currentValue == true) {
          // TODO : Should be CardComponent who said to the other to unselect the card
          this.isSelected = false;
        }
      }
    }
  }
}
