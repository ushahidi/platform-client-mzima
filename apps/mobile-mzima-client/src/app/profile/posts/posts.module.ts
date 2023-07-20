import { NgModule } from '@angular/core';
import { PostsPage } from './posts.page';
import { PostsPageRoutingModule } from './posts-routing.module';
import { SharedModule } from '@shared';
import { PostItemModule } from '../../map/components/post-item/post-item.module';

@NgModule({
  imports: [PostsPageRoutingModule, SharedModule, PostItemModule],
  declarations: [PostsPage],
})
export class PostsPageModule {}
