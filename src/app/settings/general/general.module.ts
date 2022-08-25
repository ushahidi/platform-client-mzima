import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { SharedModule } from 'src/app/shared';
import { SettingsMapComponent } from './settings-map/settings-map.component';

@NgModule({
  declarations: [GeneralComponent, SettingsMapComponent],
  imports: [CommonModule, SharedModule, GeneralRoutingModule, LeafletModule],
})
export class GeneralModule {}
