import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataImportRoutingModule } from './data-import-routing.module';
import { DataImportComponent } from './data-import.component';
import { SharedModule } from '@shared';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImportResultsComponent } from './import-results/import-results.component';

@NgModule({
  declarations: [DataImportComponent, ImportResultsComponent],
  imports: [CommonModule, DataImportRoutingModule, SharedModule, MatProgressBarModule],
})
export class DataImportModule {}
