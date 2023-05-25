import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationSelectComponent } from './location-select.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [LocationSelectComponent],
  imports: [CommonModule, IonicModule, SharedModule, FormsModule],
  exports: [LocationSelectComponent],
})
export class LocationSelectModule {}
