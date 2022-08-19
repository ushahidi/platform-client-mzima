import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { PostPopupComponent } from './post-popup/post-popup.component';

@NgModule({
  declarations: [MapComponent, PostPopupComponent],
  imports: [CommonModule, MapRoutingModule, LeafletModule],
})
export class MapModule {}
