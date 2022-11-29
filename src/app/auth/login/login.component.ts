import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  public loginError: string;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private matDialogRef: MatDialogRef<LoginComponent>,
    private translate: TranslateService,
  ) {}

  getErrorMessage(field: string) {
    if (this.form.controls[field].hasError('required')) {
      return this.translate.instant('contact.valid.email.required');
    }

    return this.form.controls['email'].hasError('email')
      ? this.translate.instant('contact.valid.email.not_valid')
      : '';
  }

  cancel() {
    this.matDialogRef.close('cancel');
  }

  login() {
    const { email, password } = this.form.value;
    this.form.disable();
    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.matDialogRef.close(response);
      },
      error: (err) => {
        this.loginError = err.error.message;
        this.form.enable();
        setTimeout(() => (this.loginError = ''), 4000);
      },
    });
  }
}
