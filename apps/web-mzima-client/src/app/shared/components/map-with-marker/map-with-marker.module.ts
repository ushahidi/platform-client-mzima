import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapWithMarkerComponent } from './map-with-marker.component';

@NgModule({
  declarations: [MapWithMarkerComponent],
  imports: [CommonModule, LeafletModule],
  exports: [MapWithMarkerComponent],
})
export class MapWithMarkerModule {}
