import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedViewComponent } from './feed-view.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { PostItemModule } from '../post-item/post-item.module';

@NgModule({
  declarations: [FeedViewComponent],
  imports: [CommonModule, IonicModule, SharedModule, PostItemModule],
  exports: [FeedViewComponent],
})
export class FeedViewModule {}
