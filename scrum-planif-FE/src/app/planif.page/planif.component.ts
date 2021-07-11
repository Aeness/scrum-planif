import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html',
  styleUrls: ['./planif.component.scss'],
  providers: [ IoWebsocketService, PlanifRoom ] // IoWebsocketService is for PlanifRoom
})
export class PlanifComponent implements OnDestroy {
  protected unsubscribe$ = new Subject();

  public init$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public planif : {ref: string, name: string, subject: string};
  public takePartIn: boolean = false;
  public resultsVisibility: boolean = false;
  public nbScrumMaster: number;


  constructor(
    protected route: ActivatedRoute,
    protected planifRoom: PlanifRoom,
    protected authService: AuthService
  ) {
    this.route.params.subscribe(
      params => {
        this.planif = {
          ref: params.planif_ref,
          name : '',
          subject : ''
        };

        this.init$.subscribe(
          (init) => {
            if (init == true) {
              this.planifRoom.name$.pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {
                  this.planif.name = data;
                }
              );
              this.planifRoom.subject$.pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {
                  this.planif.subject = data;
                }
              );

              this.askToPlayOrNot();

              this.planifRoom.resultsVisibility$.pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data: boolean) => {
                  this.resultsVisibility = data;
                }
              );
              this.planifRoom.nbScrumMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe(
                (nbScrumMaster) => {
                  this.nbScrumMaster = nbScrumMaster;
                }
              );
            }
          }
        )
        this.planifRoom.init(this.planif.ref, this.isAdmin(), () => {
          this.init$.next(true);
          this.takePartIn = true;
        });
      }
    )
  }

  protected isAdmin() : boolean {
    return false;
  }

  protected askToPlayOrNot() {
    this.planifRoom.askToPlay();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
