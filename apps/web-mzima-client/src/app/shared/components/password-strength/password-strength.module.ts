import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordStrengthComponent } from './password-strength.component';

@NgModule({
  declarations: [PasswordStrengthComponent],
  imports: [CommonModule],
  exports: [PasswordStrengthComponent],
})
export class PasswordStrengthModule {}
