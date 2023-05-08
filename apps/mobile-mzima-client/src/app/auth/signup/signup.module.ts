import { NgModule } from '@angular/core';
import { SignupPage } from './signup.page';
import { SignupPageRoutingModule } from './signup-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordStrengthModule } from './components/password-strength/password-strength.module';

@NgModule({
  imports: [SignupPageRoutingModule, SharedModule, ReactiveFormsModule, PasswordStrengthModule],
  declarations: [SignupPage],
})
export class SignupPageModule {}
