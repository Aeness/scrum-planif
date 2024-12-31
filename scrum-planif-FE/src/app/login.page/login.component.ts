import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service/auth.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { TokenTool } from '../auth.service/token.tool';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  returnUrl: string;
  submitLabel: string;

  authForm: UntypedFormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private fb: UntypedFormBuilder,
    private toastr: ToastrService
  ) {

    this.authForm = fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3)]) ]
    });
    this.authFormSubmiting(false);

    // TODO : what happen if connected in this page
  }

  authFormSubmiting(authFormSubmiting: boolean) {
    if (authFormSubmiting) {
      this.submitLabel = "En cours..."
    } else {
      this.submitLabel = "Entrer"
    }
  }

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('no-user');

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    if(this.authForm.valid) {
      this.authForm.disable();
      this.authFormSubmiting(true);
      this.authService.start(this.authForm.controls.name.value).subscribe(
        (authResult) => {
            this.authService.announceUser(TokenTool.decodeToken(authResult.token))
            this.authForm.enable();
            this.authFormSubmiting(false);
            // login successful so redirect to return url
            this.router.navigateByUrl(this.returnUrl);
        },
        err => {
          this.authForm.enable();
          this.authFormSubmiting(false);
          if (err.status == 400) {

            if (err.error.name) {
                this.authForm.controls.name.markAsDirty();
                this.authForm.controls.name.setErrors({'server': err.error.name});
            }
          } else if (err.status == 429) {
            this.toastr.error(null, 'Il y a eu trop d\'essais. Veuillez réessayer dans 5 minutes.', {
              disableTimeOut: true
            });
          } else {
              throw err;
          }
        }
      );
    }
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('no-user');
  }
}
