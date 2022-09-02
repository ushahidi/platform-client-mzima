import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { FileUploaderComponent, DonationModalComponent } from './components';

@NgModule({
  declarations: [SettingsComponent, FileUploaderComponent, DonationModalComponent],
  imports: [CommonModule, SharedModule, SettingsRoutingModule],
  exports: [FileUploaderComponent],
})
export class SettingsModule {}
