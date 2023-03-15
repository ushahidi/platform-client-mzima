import { Component, EventEmitter, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { formHelper } from '@helpers';
import { AuthService } from '@services';

@Component({
  selector: 'app-restore-password-form',
  templateUrl: './restore-password-form.component.html',
  styleUrls: ['./restore-password-form.component.scss'],
})
export class RestorePasswordFormComponent {
  @Output() passwordRestored = new EventEmitter();
  public form: FormGroup;
  public formError: string;
  public isPasswordVisible: boolean;
  public matcher = new formHelper.FormErrorStateMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.form.patchValue({
        token: params['token'],
      });
    });
    this.form = this.formBuilder.group(
      {
        token: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
        confirmPassword: [
          '',
          [Validators.required, Validators.minLength(8), Validators.maxLength(64)],
        ],
      },
      { validators: this.checkPasswords },
    );
  }

  private checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (!group) return null;
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  };

  public getErrorMessage(field: string): string {
    switch (field) {
      case 'token':
        return this.authService.getControlError(this.form, field, ['required', 'pattern']);
      case 'password':
        return this.authService.getControlError(this.form, field, [
          'required',
          'minlength',
          'maxlength',
        ]);
      case 'confirmPassword':
        return this.authService.getControlError(this.form, field, [
          'required',
          'minlength',
          'maxlength',
        ]);
      default:
        return '';
    }
  }

  public restorePassword(): void {
    const { token, password } = this.form.value;
    this.form.disable();

    this.authService.restorePassword({ token, password }).subscribe({
      next: () => {
        this.passwordRestored.emit('restored');
      },
      error: (err) => {
        this.formError = err.error?.errors[1]?.message;
        this.form.enable();
        setTimeout(() => (this.formError = ''), 4000);
      },
    });
  }

  public togglePasswordVisible(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
