import { NgModule } from '@angular/core';
import { SignupPage } from './signup.page';
import { SignupPageRoutingModule } from './signup-routing.module';
import { SharedModule } from '@shared';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [SignupPageRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [SignupPage],
})
export class SignupPageModule {}
