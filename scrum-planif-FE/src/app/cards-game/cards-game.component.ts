import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlanifRoom } from '../planif.room/planif.room';

@Component({
  selector: 'app-cards-game',
  templateUrl: './cards-game.component.html',
  styleUrls: ['../card/font-icon.scss', './cards-game.component.scss']
})
export class CardsGameComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  @Input() planifRoom: PlanifRoom;
  @Input() myGameTypeName: string;

  public cards : Array<{value: string, active: boolean}>;
  public currentGameName : string;

  constructor() { }

  ngOnInit(): void {
    this.planifRoom.allCardsList$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data) => {
        this.cards = data.get(this.myGameTypeName);
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  click(index) {
    if(this.myGameTypeName == this.planifRoom.currentGameName) {
      this.planifRoom.sendCardVisibility(index, !this.cards[index].active);
    }
  }
}
