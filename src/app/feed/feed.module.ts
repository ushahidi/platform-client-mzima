import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedComponent } from './feed.component';
import { SharedModule } from '../shared/shared.module';
import { FeedRoutingModule } from './feed-routing.module';

@NgModule({
  declarations: [FeedComponent],
  imports: [CommonModule, SharedModule, FeedRoutingModule],
})
export class FeedModule {}
