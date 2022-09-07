import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataImportRoutingModule } from './data-import-routing.module';
import { DataImportComponent } from './data-import.component';
import { SharedModule } from '@shared';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
  declarations: [DataImportComponent],
  imports: [CommonModule, DataImportRoutingModule, SharedModule, MatStepperModule],
})
export class DataImportModule {}
