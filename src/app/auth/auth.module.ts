import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LoginComponent,
  LoginFormComponent,
  RegistrationFormComponent,
  ForgotPasswordComponent,
  RestorePasswordFormComponent,
} from '@auth';
import { SharedModule } from '../shared';
import { ForgotPasswordFormComponent } from './forms/forgot-password-form/forgot-password-form.component';
import { ResetComponent } from './reset/reset.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    LoginFormComponent,
    RegistrationFormComponent,
    ForgotPasswordComponent,
    ForgotPasswordFormComponent,
    RestorePasswordFormComponent,
    ResetComponent,
  ],
  imports: [CommonModule, AuthRoutingModule, SharedModule],
})
export class AuthModule {}
