import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedViewComponent } from './feed-view.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { PostItemModule } from '../post-item/post-item.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [FeedViewComponent],
  imports: [CommonModule, IonicModule, SharedModule, PostItemModule, FormsModule],
  exports: [FeedViewComponent],
})
export class FeedViewModule {}
