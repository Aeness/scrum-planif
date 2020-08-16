import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-planif-admin',
  template: '{{planif_ref}} <app-vote></app-vote>'
})
export class PlanifAdminComponent {

  planif_ref;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(
      params => {
        this.planif_ref = params.planif_ref;
      }
    )
  }

}
