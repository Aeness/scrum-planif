import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanifRoom } from '../planif.room/planif.room';
import { AuthService } from '../auth.service/auth.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html',
  styleUrls: ['./planif.component.scss'],
  providers: [ IoWebsocketService, PlanifRoom ] // IoWebsocketService is for PlanifRoom
})
export class PlanifComponent {

  public init$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public planif : {ref: string, name: string, subject: string};
  public takePartIn: boolean = false;
  public resultsVisibility: boolean = false;


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
              this.planifRoom.name$.subscribe(
                (data) => {
                  this.planif.name = data;
                }
              );
              this.planifRoom.subject$.subscribe(
                (data) => {
                  this.planif.subject = data;
                }
              );
              this.planifRoom.askToPlay();

              this.planifRoom.resultsVisibility$.subscribe(
                (data: boolean) => {
                  this.resultsVisibility = data;
                }
              );
            }
          }
        )
        if (!authService.hasUserConnected) {
          // TODO Display a message in a toast
          window.location.reload();
        }
        this.planifRoom.init(this.planif.ref, () => {
          this.init$.next(true);
          this.takePartIn = true;
        });
      }
    )
  }
}
