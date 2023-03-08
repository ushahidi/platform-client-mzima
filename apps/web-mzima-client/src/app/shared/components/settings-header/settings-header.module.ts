import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule } from '../../directive.module';
import { SettingsHeaderComponent } from './settings-header.component';

@NgModule({
  declarations: [SettingsHeaderComponent],
  imports: [
    CommonModule,
    TranslateModule,
    DirectiveModule,
    MatButtonModule,
    RouterLink,
    MatSelectModule,
    FormsModule,
    MatIconModule,
  ],
  exports: [SettingsHeaderComponent],
})
export class SettingsHeaderModule {}
