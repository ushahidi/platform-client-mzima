import { NgModule } from '@angular/core';
import { SignupPage } from './signup.page';
import { SignupPageRoutingModule } from './signup-routing.module';
import { SharedModule } from '@shared';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordStrengthModule } from './components/password-strength/password-strength.module';
import { DeploymentInfoModule } from '../components/deployment-info/deployment-info.module';

@NgModule({
  imports: [
    SignupPageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    PasswordStrengthModule,
    DeploymentInfoModule,
  ],
  declarations: [SignupPage],
})
export class SignupPageModule {}
