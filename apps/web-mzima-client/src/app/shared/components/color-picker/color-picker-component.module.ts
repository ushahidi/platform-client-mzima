import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorPickerComponent } from './color-picker.component';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

@NgModule({
  declarations: [ColorPickerComponent],
  imports: [
    CommonModule,
    MatInputModule,
    MatMenuModule,
    FormsModule,
    ColorPickerModule,
    MatButtonModule,
    MzimaUiModule,
  ],
  exports: [ColorPickerComponent],
})
export class ColorPickerComponentModule {}
