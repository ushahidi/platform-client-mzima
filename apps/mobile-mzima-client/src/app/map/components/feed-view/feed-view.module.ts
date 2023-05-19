import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedViewComponent } from './feed-view.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [FeedViewComponent],
  imports: [CommonModule, IonicModule, SharedModule],
  exports: [FeedViewComponent],
})
export class FeedViewModule {}
