import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataExportRoutingModule } from './data-export-routing.module';
import { DataExportComponent } from './data-export.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [DataExportComponent],
  imports: [CommonModule, SharedModule, MatTabsModule, DataExportRoutingModule],
})
export class DataExportModule {}
