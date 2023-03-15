import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule } from '@shared';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { FileUploaderComponent } from './components';
import { SettingsLayoutComponent } from './settings-layout.component';

@NgModule({
  declarations: [SettingsComponent, FileUploaderComponent, SettingsLayoutComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TranslateModule,
    DirectiveModule,
    MatRippleModule,
  ],
  exports: [FileUploaderComponent],
})
export class SettingsModule {}
