import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeploymentSelectPage } from './deployment-select.page';

const routes: Routes = [
  {
    path: '',
    component: DeploymentSelectPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeploymentSelectPageRoutingModule {}
