import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '@services';
import { regexHelper } from '@helpers';
import { emailExistsValidator } from '../../../core/validators';
import { generalHelpers } from '@mzima-client/sdk';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss'],
})
export class RegistrationFormComponent {
  @Output() registered = new EventEmitter();
  public isPasswordVisible = false;
  public form: FormGroup;
  public submitted = false;
  public passwordStrong: boolean = false;

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
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
  }

  getErrorMessage(field: string) {
    switch (field) {
      case 'name':
      case 'agreement':
        return this.authService.getControlError(this.form, field, ['required']);
      case 'email':
        return this.authService.getControlError(this.form, field, [
          'required',
          'pattern',
          'emailExists',
        ]);
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
    this.submitted = true;
    this.authService.signup({ email, password, realname: name }).subscribe({
      next: (response) => {
        this.authService.login(email, password).subscribe({
          next: () => {
            this.registered.emit(response);
          },
        });
      },
      error: ({ error }) => {
        this.form.enable();
        this.submitted = false;
        if (error.errors[1].message === 'email is already in use') {
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
    this.getErrorMessage('email');
  }

  private setFieldsValidators(controls: AbstractControl[], validators: ValidatorFn[]): void {
    controls.map((control) => {
      control.setValidators(validators);
      control.updateValueAndValidity();
    });
  }

  onPasswordStrength(isStrong: boolean) {
    this.passwordStrong = isStrong;
  }
}
