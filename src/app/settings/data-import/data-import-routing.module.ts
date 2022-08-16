import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataImportComponent } from './data-import.component';

const routes: Routes = [{ path: '', component: DataImportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataImportRoutingModule {}
