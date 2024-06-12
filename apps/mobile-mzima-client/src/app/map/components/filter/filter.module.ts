import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateSelectModule } from '../date-select/date-select.module';
import { LocationSelectModule } from '../location-select/location-select.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [FilterComponent],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    DateSelectModule,
    LocationSelectModule,
    TranslateModule,
  ],
  exports: [FilterComponent],
})
export class FilterModule {}
