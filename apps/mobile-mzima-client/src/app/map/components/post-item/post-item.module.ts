import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostItemComponent } from './post-item.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { TwitterWidgetModule } from '../twitter-widget/twitter-widget.module';

@NgModule({
  declarations: [PostItemComponent],
  imports: [CommonModule, IonicModule, SharedModule, TwitterWidgetModule],
  exports: [PostItemComponent],
})
export class PostItemModule {}
