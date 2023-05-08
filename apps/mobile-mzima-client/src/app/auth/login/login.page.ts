import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { regexHelper } from '@helpers';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {
  public form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
  });
  public forgotPasswordForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
  });
  public isForgotPasswordModalOpen = false;

  constructor(private formBuilder: FormBuilder) {}

  public login(): void {
    // TODO: Login functionality
    console.log('login');
  }

  public forgotPassword(): void {
    // TODO: Forgot password functionality
    console.log('forgotPassword');
  }

  public openForgotPasswordModal(): void {
    this.isForgotPasswordModalOpen = true;

    // const modal = await this.modalCtrl.create({
    //   component: ForgotPasswordModalComponent,
    // });
    // modal.present();
  }
}
