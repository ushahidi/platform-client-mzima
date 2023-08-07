import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { regexHelper } from '@helpers';
import { AlertService, AuthService, DeploymentService, SessionService } from '@services';
import { fieldErrorMessages } from '@helpers';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {
  public form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
  });
  public forgotPasswordForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
  });
  public isForgotPasswordModalOpen = false;
  public loginError: string;
  public forgotPasswordError: string;
  public fieldErrorMessages = fieldErrorMessages;
  public isPrivate = true;
  public adminEmail = '';

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private deploymentService: DeploymentService,
    private sessionService: SessionService,
  ) {
    const siteConfig = this.sessionService.getSiteConfigurations();
    this.isPrivate = !!siteConfig.private;

    this.sessionService.siteConfig$.pipe(untilDestroyed(this)).subscribe({
      next: (config) => {
        this.isPrivate = !!config.private;
      },
    });

    this.deploymentService.deployment$.pipe(untilDestroyed(this)).subscribe({
      next: (deployment) => {
        this.adminEmail = `admin@${deployment?.fqdn.toLowerCase()}`;
      },
    });
  }

  public login(): void {
    const { email, password } = this.form.value;
    if (!email || !password) return;
    this.form.disable();
    this.authService.login(email, password).subscribe({
      next: () => {
        this.form.enable();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loginError = err.error.message;
        this.form.enable();
        setTimeout(() => (this.loginError = ''), 4000);
      },
    });
  }

  public forgotPassword(): void {
    const { email } = this.form.value;
    if (!email) return;
    this.forgotPasswordForm.disable();
    this.authService.resetPassword({ email }).subscribe({
      next: async () => {
        await this.alertService.presentAlert({
          header: 'Check your inbox',
          message:
            'We sent a reset link to your Email. Follow the instructions to reset your password.',
        });
        this.router.navigate(['auth/login']);
        this.form.enable();
      },
      error: (err) => {
        this.forgotPasswordError = err?.error?.message ?? err?.message;
        this.forgotPasswordForm.enable();
        setTimeout(() => (this.forgotPasswordError = ''), 4000);
      },
    });
  }

  public openForgotPasswordModal(): void {
    this.isForgotPasswordModalOpen = true;
  }

  public chooseDeployment(): void {
    this.deploymentService.removeDeployment();
    this.router.navigate(['deployment']);
  }
}
