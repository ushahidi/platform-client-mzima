import { NgModule } from '@angular/core';
import { SettingsPage } from './settings.page';
import { SettingsPageRoutingModule } from './settings-routing.module';
import { SharedModule } from '@shared';

@NgModule({
  imports: [SettingsPageRoutingModule, SharedModule],
  declarations: [SettingsPage],
})
export class SettingsPageModule {}
