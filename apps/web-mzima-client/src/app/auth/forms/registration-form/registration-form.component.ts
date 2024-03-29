import { Component, EventEmitter, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
  ValidationErrors,
} from '@angular/forms';
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
  public isConfirmasswordVisible = false;
  public form: FormGroup;
  public submitted = false;

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group(
      {
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
        confirmPassword: ['', [Validators.required]],
        agreement: [false, [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  private passwordMatchValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    if (!control) return null;
    console.log(this.form);

    return control.get('password')?.value === control.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  };

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
  toggleConfirmPasswordVisible() {
    this.isConfirmasswordVisible = !this.isConfirmasswordVisible;
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
}
