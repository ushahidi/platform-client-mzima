import { NgModule } from '@angular/core';
import { LoginPage } from './login.page';
import { LoginPageRoutingModule } from './login-routing.module';
import { SharedModule } from '@shared';
import { ReactiveFormsModule } from '@angular/forms';
import { DeploymentInfoModule } from '../components/deployment-info/deployment-info.module';

@NgModule({
  imports: [LoginPageRoutingModule, SharedModule, ReactiveFormsModule, DeploymentInfoModule],
  declarations: [LoginPage],
})
export class LoginPageModule {}
