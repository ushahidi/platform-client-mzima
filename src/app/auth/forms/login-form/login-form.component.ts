import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@services';
import { regexHelper } from '@helpers';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
  @Output() loggined = new EventEmitter();
  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
    password: ['', [Validators.required]],
  });
  public loginError: string;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
  ) {}

  getErrorMessage(field: string) {
    switch (field) {
      case 'email':
        return this.form.controls['email'].hasError('pattern')
          ? this.translate.instant('user.valid.email.email')
          : this.form.controls['email'].hasError('required')
          ? this.translate.instant('user.valid.email.required')
          : '';
      case 'password':
        return this.form.controls['password'].hasError('required')
          ? this.translate.instant('user.valid.password.required')
          : '';
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
}
