import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
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

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
  ) {}

  getErrorMessage(field: string) {
    switch (field) {
      case 'name':
      case 'password':
      case 'agreement':
        return this.form.controls[field].hasError('required')
          ? this.translate.instant(`user.valid.${field}.required`)
          : '';
      case 'email':
        return this.form.controls['email'].hasError('pattern')
          ? this.translate.instant('user.valid.email.email')
          : this.form.controls['email'].hasError('required')
          ? this.translate.instant('user.valid.email.required')
          : '';
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
