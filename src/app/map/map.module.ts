import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { SharedModule } from '../shared/shared.module';
import { PostDetailsModalComponent } from './post-details-modal/post-details-modal.component';

@NgModule({
  declarations: [MapComponent, PostDetailsModalComponent],
  imports: [CommonModule, MapRoutingModule, SharedModule],
})
export class MapModule {}
