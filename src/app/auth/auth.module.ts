import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import {
  LoginComponent,
  LoginFormComponent,
  RegistrationFormComponent,
  ForgotPasswordComponent,
  RestorePasswordFormComponent,
  ForgotPasswordFormComponent,
  ResetComponent,
} from '@auth';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule, LottieAnimationModule, PasswordStrengthModule } from '@shared';
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
  imports: [
    CommonModule,
    AuthRoutingModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
    MatIconModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatTabsModule,
    LottieAnimationModule,
    DirectiveModule,
    PasswordStrengthModule,
  ],
})
export class AuthModule {}
