import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataSourceFormComponent } from './data-source-form/data-source-form.component';

import { DataSourcesComponent } from './data-sources.component';

const routes: Routes = [
  {
    path: '',
    component: DataSourcesComponent,
    children: [
      { path: ':id', component: DataSourceFormComponent }, //
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataSourcesRoutingModule {}
