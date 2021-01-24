import { AfterViewInit, Component, Directive, Input, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { PlanifRoom } from '../planif.room/planif.room';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent /*implements AfterViewInit*/ {
  public init: boolean = false;

  @Input() planifRoom: PlanifRoom;
  @Input() isAdmin: Boolean = false;

  public values : string[] = [];
  public allValues : {value: string, active: boolean}[] = [];

  @ViewChildren('card') cards!: QueryList<CardComponent>;

  private choosenValue : string;

  ngAfterViewInit() {

    this.planifRoom.listenRestartMyChoise().subscribe(
      () => {
        this.choosenValue = null;
        this.planifRoom.sendPlanifChoise(null);

        this.cards.forEach(card => {
          card.unselectedIfNot(null);
        });
      }
    );
    setTimeout(() => {
    // TODO : use this.planifRoom.listen.....
      this.planifRoom.cardsList$.subscribe(
        (data : {value: string, active: boolean}[]) => {

          data.forEach(element => {
            this.allValues.push(element);
            if (element.active) {
              this.values.push(element.value);
            }
          })
          this.init = true;
        }
      );

      this.planifRoom.listenCardVisibility().subscribe(
        (data : {cardIndex: number, choosenVisibility : boolean}) => {
          //No need because we use the list updated by planifRoom
          //this.allValues[data.cardIndex].active = data.choosenVisibility;

          if(this.allValues[data.cardIndex].value == this.choosenValue
            && data.choosenVisibility == false) {
            this.choosenValue = null;
            this.planifRoom.sendPlanifChoise(null);
          }

          let newValues:string[] = [];
          this.allValues.forEach(element => {
            if (element.active) {
              newValues.push(element.value);
            }
          })
          this.values = newValues;
        }
      );
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("#####");
    console.log(changes);

    for (let propName in changes) {
      let chng = changes[propName];
      //console.log(`[ngOnChanges]${propName}: currentValue = ${JSON.stringify(chng.currentValue)}, previousValue = ${JSON.stringify(chng.previousValue)}`);
      console.log(`[ngOnChanges]${propName}`);
    }
  }

  changeValue(value: string, active: Boolean) {
    if (value == this.choosenValue && active == false) {
      this.choosenValue = null;
      this.planifRoom.sendPlanifChoise(null);
    } else if (value != this.choosenValue && active == false) {
      // do nothing
    } else if (value != this.choosenValue && active == true) {

      this.cards.forEach(card => {
        card.unselectedIfNot(value);
      });

      this.choosenValue = value;
      this.planifRoom.sendPlanifChoise(value);
    }
  }

}
