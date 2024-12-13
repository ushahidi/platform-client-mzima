import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataSourceItemComponent } from './data-source-item/data-source-item.component';

import { DataSourcesComponent } from './data-sources.component';

const routes: Routes = [
  {
    path: '',
    component: DataSourcesComponent,
  },
  {
    path: 'update/:id',
    component: DataSourceItemComponent,
    data: { breadcrumb: 'nav.data_source' },
  },
  { path: 'create', component: DataSourceItemComponent, data: { breadcrumb: 'nav.data_source' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataSourcesRoutingModule {}
