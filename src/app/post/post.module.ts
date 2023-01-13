import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostRoutingModule } from './post-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { PostItemComponent } from './post-item/post-item.component';
import { AddPostModalComponent } from './add-post-modal/add-post-modal.component';
import { SharedModule } from '@shared';
import { LocationSelectComponent } from './location-select/location-select.component';
import { PostPreviewComponent } from './post-preview/post-preview.component';
import { PostDetailsComponent } from './post-details/post-details.component';
import { PostMetadataComponent } from './post-metadata/post-metadata.component';
import { TwitterWidgetComponent } from './twitter-widget/twitter-widget.component';
import { PostHeadComponent } from './post-head/post-head.component';

@NgModule({
  declarations: [
    PostItemComponent,
    AddPostModalComponent,
    LocationSelectComponent,
    PostPreviewComponent,
    PostDetailsComponent,
    PostMetadataComponent,
    TwitterWidgetComponent,
    PostHeadComponent,
  ],
  imports: [CommonModule, SharedModule, PostRoutingModule, LeafletModule],
  exports: [PostPreviewComponent, PostDetailsComponent, PostMetadataComponent],
})
export class PostModule {}
