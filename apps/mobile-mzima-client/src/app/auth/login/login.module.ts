import { NgModule } from '@angular/core';
import { LoginPage } from './login.page';
import { LoginPageRoutingModule } from './login-routing.module';
import { SharedModule } from '@shared';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [LoginPageRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [LoginPage],
})
export class LoginPageModule {}
