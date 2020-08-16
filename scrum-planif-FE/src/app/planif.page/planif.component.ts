import { Component, OnInit, ViewChild } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-planif',
  templateUrl: './planif.component.html'
})
export class PlanifComponent {
  private planif_ref;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(
      params => {
        this.planif_ref = params.planif_ref;
      }
    )
  }
}
