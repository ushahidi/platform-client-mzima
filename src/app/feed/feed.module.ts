import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedComponent } from './feed.component';
import { SharedModule } from '../shared/shared.module';
import { FeedRoutingModule } from './feed-routing.module';
import { PostModule } from '../post/post.module';
import { NgxMasonryModule } from 'ngx-masonry';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [FeedComponent],
  imports: [
    CommonModule,
    SharedModule,
    FeedRoutingModule,
    PostModule,
    NgxMasonryModule,
    NgxPaginationModule,
  ],
})
export class FeedModule {}
