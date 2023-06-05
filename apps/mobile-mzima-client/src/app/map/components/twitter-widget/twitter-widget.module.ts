import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwitterWidgetComponent } from './twitter-widget.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [TwitterWidgetComponent, TwitterWidgetComponent],
  imports: [CommonModule, IonicModule, SharedModule],
  exports: [TwitterWidgetComponent],
})
export class TwitterWidgetModule {}
