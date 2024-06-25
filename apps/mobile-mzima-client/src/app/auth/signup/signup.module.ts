import { NgModule } from '@angular/core';
import { SignupPage } from './signup.page';
import { SignupPageRoutingModule } from './signup-routing.module';
import { SharedModule } from '@shared';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [SignupPageRoutingModule, SharedModule, ReactiveFormsModule, TranslateModule],
  declarations: [SignupPage],
})
export class SignupPageModule {}
