import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostItemComponent } from './post-item.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { PrependUrlModule } from '@pipes';
import { TwitterWidgetModule } from '../twitter-widget/twitter-widget.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [PostItemComponent],
  imports: [
    CommonModule,
    IonicModule,
    PrependUrlModule,
    SharedModule,
    TwitterWidgetModule,
    TranslateModule,
  ],
  exports: [PostItemComponent],
})
export class PostItemModule {}
