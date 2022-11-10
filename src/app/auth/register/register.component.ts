import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '@services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public form: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private matDialogRef: MatDialogRef<RegisterComponent>,
  ) {}

  getErrorMessage(field: string) {
    if (this.form.controls[field].hasError('required')) {
      return 'You must enter a value';
    }

    return this.form.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  cancel() {
    this.matDialogRef.close('cancel');
  }

  signup() {
    const { email, password, name } = this.form.value;
    this.form.disable();
    this.authService.signup({ email, password, realname: name }).subscribe({
      next: (response) => {
        this.matDialogRef.close(response);
      },
      error: () => {
        this.form.enable();
      },
    });
  }
}
