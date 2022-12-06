import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@services';
import { regexHelper } from '@helpers';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss'],
})
export class RegistrationFormComponent {
  @Output() registered = new EventEmitter();
  public isPasswordVisible = false;
  public form: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
    password: ['', [Validators.required]],
    agreement: [false, [Validators.required]],
  });

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {}

  getErrorMessage(field: string) {
    if (this.form.controls[field].hasError('required')) {
      return 'You must enter a value';
    }

    return this.form.controls['email'].hasError('pattern') ? 'Not a valid email' : '';
  }

  togglePasswordVisible() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  signup() {
    const { email, password, name } = this.form.value;
    this.form.disable();
    this.authService.signup({ email, password, realname: name }).subscribe({
      next: (response) => {
        this.registered.emit(response);
      },
      error: () => {
        this.form.enable();
      },
    });
  }
}
