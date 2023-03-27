import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule, SpinnerModule } from '@shared';

import { DataExportRoutingModule } from './data-export-routing.module';
import { DataExportComponent } from './data-export.component';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

@NgModule({
  declarations: [DataExportComponent],
  imports: [
    CommonModule,
    DataExportRoutingModule,
    TranslateModule,
    MatTabsModule,
    DirectiveModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    FormsModule,
    MatIconModule,
    SpinnerModule,
    MatFormFieldModule,
    MzimaUiModule,
  ],
})
export class DataExportModule {}
