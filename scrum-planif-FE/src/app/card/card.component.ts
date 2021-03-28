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
      let chng = changes[propName];
      //console.log(`[ngOnChanges]${propName}: currentValue = ${JSON.stringify(chng.currentValue)}, previousValue = ${JSON.stringify(chng.previousValue)}`);
      if (propName == "isDesactived") {
        if (chng.currentValue == true && this.isSelected) {
          this.isSelected = false;
          this.choosenEvent.emit(this.isSelected);
        }
      }
    }
  }
}
