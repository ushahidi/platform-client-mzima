import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationSelectComponent } from './location-select.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MaterialModule } from '../../material.module';

@NgModule({
  declarations: [LocationSelectComponent],
  imports: [CommonModule, LeafletModule, MaterialModule],
  exports: [LocationSelectComponent],
})
export class LocationSelectModule {}
