import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateSelectComponent } from './date-select.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [DateSelectComponent],
  imports: [CommonModule, IonicModule, SharedModule, FormsModule, ReactiveFormsModule],
  exports: [DateSelectComponent],
})
export class DateSelectModule {}
