import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateSelectComponent } from './date-select.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { CalendarModule } from 'ion2-calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [DateSelectComponent],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    CalendarModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [DateSelectComponent],
})
export class DateSelectModule {}
