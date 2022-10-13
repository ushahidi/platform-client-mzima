import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataExportRoutingModule } from './data-export-routing.module';
import { DataExportComponent } from './data-export.component';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [DataExportComponent],
  imports: [CommonModule, SharedModule, DataExportRoutingModule],
})
export class DataExportModule {}
