import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataImportRoutingModule } from './data-import-routing.module';
import { DataImportComponent } from './data-import.component';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [DataImportComponent],
  imports: [CommonModule, DataImportRoutingModule, SharedModule],
})
export class DataImportModule {}
