import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationControlComponent } from './location-control.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [LocationControlComponent],
  imports: [CommonModule, IonicModule, SharedModule, LeafletModule, TranslateModule],
  exports: [LocationControlComponent],
})
export class LocationControlModule {}
