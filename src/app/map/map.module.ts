import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { PostComponent } from './post/post.component';
import { SharedModule } from '../shared/shared.module';
import { PostDetailsComponent } from './post-details/post-details.component';

@NgModule({
  declarations: [MapComponent, PostComponent, PostDetailsComponent],
  imports: [CommonModule, MapRoutingModule, LeafletModule, SharedModule],
})
export class MapModule {}
