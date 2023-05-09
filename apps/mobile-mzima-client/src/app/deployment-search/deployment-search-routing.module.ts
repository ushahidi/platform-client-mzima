import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeploymentSearchPage } from './deployment-search.page';

const routes: Routes = [
  {
    path: '',
    component: DeploymentSearchPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeploymentSearchPageRoutingModule {}
