import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = new FormControl('procoders@ushahidi.com', [Validators.required, Validators.email]);
  password = new FormControl('TestUser123', [Validators.required]);

  constructor(
    private authService: AuthService,
    private matDialogRef: MatDialogRef<LoginComponent>,
  ) {}

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  cancel() {}

  login() {
    if (this.email.value && this.password.value)
      this.authService.login(this.email.value, this.password.value).subscribe((what) => {
        console.log('111111', what);
        this.matDialogRef.close(what);
      });
  }
}
