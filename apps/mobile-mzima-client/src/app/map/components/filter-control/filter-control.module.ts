import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterControlComponent } from './filter-control.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [FilterControlComponent],
  imports: [CommonModule, IonicModule, SharedModule],
  exports: [FilterControlComponent],
})
export class FilterControlModule {}
