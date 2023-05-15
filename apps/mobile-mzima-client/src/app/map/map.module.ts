import { NgModule } from '@angular/core';
import { MapPage } from './map.page';
import { MapPageRoutingModule } from './map-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [MapPageRoutingModule, SharedModule],
  declarations: [MapPage],
})
export class MapPageModule {}
