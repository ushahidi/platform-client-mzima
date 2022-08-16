import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataExportComponent } from './data-export.component';

const routes: Routes = [{ path: '', component: DataExportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataExportRoutingModule {}
