import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostRoutingModule } from './post-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CreateComponent } from './create/create.component';
import { AddPostModalComponent } from './add-post-modal/add-post-modal.component';
import { SharedModule } from '../shared';
import { LocationSelectComponent } from './location-select/location-select.component';

@NgModule({
  declarations: [CreateComponent, AddPostModalComponent, LocationSelectComponent],
  imports: [CommonModule, SharedModule, PostRoutingModule, LeafletModule],
})
export class PostModule {}
