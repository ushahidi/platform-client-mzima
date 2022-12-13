import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { regexHelper } from '@helpers';
import { AuthService } from '@services';

@Component({
  selector: 'app-forgot-password-form',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss'],
})
export class ForgotPasswordFormComponent {
  @Output() submitted = new EventEmitter();
  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
  });
  public formError: string;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) {}

  public resetPassword(): void {
    const { email } = this.form.value;
    this.form.disable();
    this.authService.resetPassword({ email }).subscribe({
      next: () => {
        this.submitted.emit('sent');
      },
      error: (err) => {
        this.formError = err.error.message;
        this.form.enable();
        setTimeout(() => (this.formError = ''), 4000);
      },
    });
  }

  public getErrorMessage(field: string): string {
    return this.authService.getControlError(this.form, field, ['required', 'pattern']);
  }
}
