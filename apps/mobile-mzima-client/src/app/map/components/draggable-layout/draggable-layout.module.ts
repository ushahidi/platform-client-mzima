import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraggableLayoutComponent } from './draggable-layout.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [DraggableLayoutComponent],
  imports: [CommonModule, IonicModule, SharedModule],
  exports: [DraggableLayoutComponent],
})
export class DraggableLayoutModule {}
