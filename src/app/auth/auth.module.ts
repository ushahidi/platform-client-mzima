import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent, LoginFormComponent, RegistrationFormComponent } from '@auth';
import { SharedModule } from '../shared';

@NgModule({
  declarations: [LoginComponent, LoginFormComponent, RegistrationFormComponent],
  imports: [CommonModule, SharedModule],
})
export class AuthModule {}
