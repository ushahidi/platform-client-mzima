import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostRoutingModule } from './post-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CreateComponent } from './create/create.component';
import { AddPostModalComponent } from './add-post-modal/add-post-modal.component';
import { SharedModule } from '../shared';

@NgModule({
  declarations: [CreateComponent, AddPostModalComponent],
  imports: [CommonModule, SharedModule, PostRoutingModule, LeafletModule],
})
export class PostModule {}
