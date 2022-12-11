import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  public isPasswordVisible = false;

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {}

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
}
