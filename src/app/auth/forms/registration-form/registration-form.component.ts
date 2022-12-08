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
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
    agreement: [false, [Validators.required]],
  });

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {}

  getErrorMessage(field: string) {
    switch (field) {
      case 'name':
      case 'agreement':
        return this.authService.getControlError(this.form, field, ['required']);
      case 'email':
        return this.authService.getControlError(this.form, field, ['required', 'pattern']);
      case 'password':
        return this.authService.getControlError(this.form, field, [
          'required',
          'minlength',
          'maxlength',
        ]);
    }
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
