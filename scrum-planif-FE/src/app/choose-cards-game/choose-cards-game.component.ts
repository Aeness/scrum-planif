import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlanifRoom } from '../planif.room/planif.room';

@Component({
  selector: 'app-choose-cards-game',
  templateUrl: './choose-cards-game.component.html',
  styleUrls: ['./choose-cards-game.component.scss']
})
export class ChooseCardsGameComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  @Input() planifRoom: PlanifRoom;

  public gameTypeForm: FormGroup;

  public gamesType : Map<string, Array<{value: string, active: boolean}>>;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.gameTypeForm = this.fb.group({
      gameName: [this.planifRoom.currentGameName/*, Validators.required*/]
    });

    this.planifRoom.allCardsList$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data : Map<string, Array<{value: string, active: boolean}>>) => {
        this.gamesType = data;
      }
    );

    this.planifRoom.currentGameName$.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data : string) => {
        this.gameTypeForm.get("gameName").setValue(data)
      }
    );
  }

  public gameTypeChoosenChange(selected, gameName) {
    if (!selected) {
      this.planifRoom.sendTypeGame(gameName);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
