import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html'
})
export class IndexComponent {
  ref_link = Math.random().toString(36).substr(2, 9);

  planifForm: UntypedFormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: UntypedFormBuilder
  ) {

    this.planifForm = fb.group({
      ref_planif: ['', Validators.required]
    });
  }

  onSubmit() {
    if(this.planifForm.valid) {
      this.router.navigate(['/planif', this.planifForm.controls.ref_planif.value])
    }
  }
}
