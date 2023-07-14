import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, EventBusService, EventType } from '@services';
import { regexHelper } from '@helpers';
import { ForgotPasswordComponent } from '@auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
  @Output() loggined = new EventEmitter();
  public form: FormGroup;
  public loginError: string;
  public isPasswordVisible = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private eventBusService: EventBusService,
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
      password: ['', [Validators.required]],
    });
  }

  getErrorMessage(field: string) {
    switch (field) {
      case 'email':
        return this.authService.getControlError(this.form, field, ['required', 'pattern']);
      case 'password':
        return this.authService.getControlError(this.form, field, ['required']);
    }
  }

  login() {
    const { email, password } = this.form.value;
    this.form.disable();
    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.loggined.emit(response);
      },
      error: (err) => {
        this.loginError = err.error.message;
        this.form.enable();
        setTimeout(() => (this.loginError = ''), 4000);
      },
    });
  }

  togglePasswordVisible() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  public async restorePassword(): Promise<void> {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      width: '100%',
      maxWidth: 576,
      panelClass: ['modal', 'forgot-password-modal'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate([`/reset`]);
      } else {
        this.eventBusService.next({
          type: EventType.OpenLoginModal,
          payload: true,
        });
      }
    });
  }
}
