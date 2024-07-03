import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationSelectComponent } from './location-select.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [LocationSelectComponent],
  imports: [CommonModule, IonicModule, SharedModule, FormsModule, TranslateModule],
  exports: [LocationSelectComponent],
})
export class LocationSelectModule {}
