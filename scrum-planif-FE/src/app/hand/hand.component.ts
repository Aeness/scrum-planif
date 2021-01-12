import { AfterViewInit, Component, Directive, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { PlanifRoom } from '../planif.room/planif.room';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent implements AfterViewInit {

  @Input() planifRoom: PlanifRoom;
  @Input() isAdmin: Boolean = false;

  public values = ["0","1/2","1","2","3","5","8","13","&#xf534;","&#xf0f4;"];

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
