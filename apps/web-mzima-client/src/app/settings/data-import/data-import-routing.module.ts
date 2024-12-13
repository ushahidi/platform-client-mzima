import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataImportComponent } from './data-import.component';
import { ImportResultsComponent } from './import-results/import-results.component';

const routes: Routes = [
  { path: '', component: DataImportComponent },
  {
    path: 'results',
    component: ImportResultsComponent,
    data: {
      breadcrumb: 'nav.results',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataImportRoutingModule {}
