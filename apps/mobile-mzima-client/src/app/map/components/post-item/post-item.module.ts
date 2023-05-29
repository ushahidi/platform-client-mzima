import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostItemComponent } from './post-item.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [PostItemComponent],
  imports: [CommonModule, IonicModule, SharedModule],
  exports: [PostItemComponent],
})
export class PostItemModule {}
