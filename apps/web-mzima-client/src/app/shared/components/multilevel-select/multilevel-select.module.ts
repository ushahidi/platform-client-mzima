import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTreeModule } from '@angular/material/tree';
import { MultilevelSelectComponent } from './multilevel-select.component';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

@NgModule({
  declarations: [MultilevelSelectComponent],
  imports: [
    CommonModule,
    MatMenuModule,
    MatTreeModule,
    MatListModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MzimaUiModule,
  ],
  exports: [MultilevelSelectComponent],
})
export class MultilevelSelectModule {}
