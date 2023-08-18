import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fieldErrorMessages, regexHelper } from '@helpers';
import { generalHelpers } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService, DeploymentService, SessionService } from '@services';
import { emailExistsValidator } from '@validators';

@UntilDestroy()
@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
})
export class SignupPage {
  public form = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(generalHelpers.CONST.MIN_PASSWORD_LENGTH),
        Validators.maxLength(generalHelpers.CONST.MAX_PASSWORD_LENGTH),
      ],
    ],
    agreement: [false, [Validators.required]],
  });
  public signupError: string;
  public fieldErrorMessages = fieldErrorMessages;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private deploymentService: DeploymentService,
    private sessionService: SessionService,
  ) {
    const siteConfig = this.sessionService.getSiteConfigurations();
    if (siteConfig.private) {
      this.router.navigate(['auth/login']);
    }

    this.sessionService.siteConfig$.pipe(untilDestroyed(this)).subscribe({
      next: (config) => {
        if (config.private) {
          this.router.navigate(['auth/login']);
        }
      },
    });
  }

  public signUp(): void {
    const { name, email, password } = this.form.value;
    if (!name || !email || !password) return;
    this.form.disable();
    this.authService.signup({ email, password, realname: name }).subscribe({
      next: () => {
        this.form.enable();
        this.authService.login(email, password).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
        });
      },
      error: ({ error }) => {
        this.form.enable();

        if (error.errors[1].message === 'email is already in use') {
          this.signupError = error.errors[1].message;
          this.checkExistEmailError(true);
          setTimeout(() => {
            this.checkExistEmailError(false);
          }, 3000);
        }
      },
    });
  }

  private checkExistEmailError(isExists: boolean) {
    this.setFieldsValidators([this.form.controls['email']], [emailExistsValidator(isExists)]);
  }

  private setFieldsValidators(controls: AbstractControl[], validators: ValidatorFn[]): void {
    controls.map((control) => {
      control.setValidators(validators);
      control.updateValueAndValidity();
    });
  }

  public openLink(event: Event, link: string): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('open: ', link);
  }

  public chooseDeployment(): void {
    this.deploymentService.removeDeployment();
    this.router.navigate(['deployment']);
  }
}
