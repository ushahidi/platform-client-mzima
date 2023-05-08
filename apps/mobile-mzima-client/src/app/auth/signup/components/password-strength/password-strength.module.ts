import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordStrengthComponent } from './password-strength.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [PasswordStrengthComponent],
  imports: [CommonModule, IonicModule],
  exports: [PasswordStrengthComponent],
})
export class PasswordStrengthModule {}
