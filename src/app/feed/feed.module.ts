import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedComponent } from './feed.component';
import { SharedModule } from '../shared/shared.module';
import { FeedRoutingModule } from './feed-routing.module';
import { FeedItemComponent } from './feed-item/feed-item.component';

@NgModule({
  declarations: [FeedComponent, FeedItemComponent],
  imports: [CommonModule, SharedModule, FeedRoutingModule],
})
export class FeedModule {}
