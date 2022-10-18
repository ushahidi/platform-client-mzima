import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { FileUploaderComponent, DonationModalComponent } from './components';
import { SettingsLayoutComponent } from './settings-layout.component';

@NgModule({
  declarations: [
    SettingsComponent,
    FileUploaderComponent,
    DonationModalComponent,
    SettingsLayoutComponent,
  ],
  imports: [CommonModule, SharedModule, SettingsRoutingModule],
  exports: [FileUploaderComponent],
})
export class SettingsModule {}
