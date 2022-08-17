import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataExportRoutingModule } from './data-export-routing.module';
import { DataExportComponent } from './data-export.component';

@NgModule({
  declarations: [DataExportComponent],
  imports: [CommonModule, DataExportRoutingModule],
})
export class DataExportModule {}
