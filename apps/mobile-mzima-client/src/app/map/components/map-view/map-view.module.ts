import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapViewComponent } from './map-view.component';
import { IonicModule } from '@ionic/angular';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@NgModule({
  declarations: [MapViewComponent],
  imports: [CommonModule, IonicModule, LeafletModule],
  exports: [MapViewComponent],
})
export class MapViewModule {}
