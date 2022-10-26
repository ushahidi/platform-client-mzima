import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostRoutingModule } from './post-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CreateComponent } from './create/create.component';
import { AddPostModalComponent } from './add-post-modal/add-post-modal.component';
import { SharedModule } from '../shared';
import { LocationSelectComponent } from './location-select/location-select.component';
import { PostPreviewComponent } from './post-preview/post-preview.component';
import { PostDetailsComponent } from './post-details/post-details.component';
import { PostMetadataComponent } from './post-metadata/post-metadata.component';

@NgModule({
  declarations: [
    CreateComponent,
    AddPostModalComponent,
    LocationSelectComponent,
    PostPreviewComponent,
    PostDetailsComponent,
    PostMetadataComponent,
  ],
  imports: [CommonModule, SharedModule, PostRoutingModule, LeafletModule],
  exports: [PostPreviewComponent, PostDetailsComponent],
})
export class PostModule {}
