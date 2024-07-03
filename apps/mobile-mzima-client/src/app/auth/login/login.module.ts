import { NgModule } from '@angular/core';
import { LoginPage } from './login.page';
import { LoginPageRoutingModule } from './login-routing.module';
import { SharedModule } from '@shared';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [LoginPageRoutingModule, SharedModule, ReactiveFormsModule, TranslateModule],
  declarations: [LoginPage],
})
export class LoginPageModule {}
