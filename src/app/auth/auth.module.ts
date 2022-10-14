import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '@auth';
import { SharedModule } from '../shared';

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, SharedModule],
})
export class AuthModule {}
