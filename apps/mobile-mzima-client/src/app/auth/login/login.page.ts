import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { regexHelper } from '@helpers';
import { AlertService, AuthService } from '@services';
import { fieldErrorMessages } from '@helpers';

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

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
  ) {}

  public login(): void {
    const { email, password } = this.form.value;
    if (!email || !password) return;
    this.form.disable();
    this.authService.login(email, password).subscribe({
      next: () => {
        this.form.enable();
        this.router.navigate(['/map']);
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
}
