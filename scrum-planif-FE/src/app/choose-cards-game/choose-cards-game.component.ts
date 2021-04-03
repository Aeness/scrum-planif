import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlanifRoom } from '../planif.room/planif.room';

@Component({
  selector: 'app-choose-cards-game',
  templateUrl: './choose-cards-game.component.html',
  styleUrls: ['../card/font-icon.scss', './choose-cards-game.component.scss']
})
export class ChooseCardsGameComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  @Input() planifRoom: PlanifRoom;

  public cards : Array<{value: string, active: boolean}>;
  public gameTypeChoosen = new FormControl(false);

  constructor() { }

  ngOnInit(): void {
    this.planifRoom.cardsList$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data) => {
        this.cards = data;
        // TODO do better
        if (Array.isArray(data) && data.length > 0 && data[0].value == "XS"
            && this.gameTypeChoosen.value !== true) {
          this.gameTypeChoosen.setValue(true);
        }
      }
    );
  }

  public gameTypeChoosenChange() {
    if (this.gameTypeChoosen.value) {
      this.planifRoom.sendTypeGameToTshirt();
    } else {
      this.planifRoom.sendTypeGameToNumber();
    }
  }

  click(index) {
    //this.cards[index].active = !this.cards[index].active ;
    this.planifRoom.sendCardVisibility(index, !this.cards[index].active);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
