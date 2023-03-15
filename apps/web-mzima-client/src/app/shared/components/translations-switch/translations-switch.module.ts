import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationsSwitchComponent } from './translations-switch.component';

@NgModule({
  declarations: [TranslationsSwitchComponent],
  imports: [CommonModule, TranslateModule, MatButtonModule, MatIconModule],
  exports: [TranslationsSwitchComponent],
})
export class TranslationsSwitchModule {}
