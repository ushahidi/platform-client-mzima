import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataSourcesComponent } from './data-sources.component';

const routes: Routes = [{ path: '', component: DataSourcesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataSourcesRoutingModule {}
