import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTreeModule } from '@angular/material/tree';
import { TranslateModule } from '@ngx-translate/core';
import { LocationSelectionModule } from '../location-selection/location-selection.module';
import { FilterControlComponent } from './filter-control.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [FilterControlComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatRadioModule,
    FormsModule,
    TranslateModule,
    MatIconModule,
    MatListModule,
    MatTreeModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatCheckboxModule,
    LocationSelectionModule,
  ],
  exports: [FilterControlComponent],
})
export class FilterControlModule {}
