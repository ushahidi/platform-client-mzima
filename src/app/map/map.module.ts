import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { SharedModule } from '../shared/shared.module';
import { PostDetailsModalComponent } from './post-details-modal/post-details-modal.component';
import { PostModule } from '../post/post.module';

@NgModule({
  declarations: [MapComponent, PostDetailsModalComponent],
  imports: [CommonModule, MapRoutingModule, SharedModule, PostModule],
})
export class MapModule {}
