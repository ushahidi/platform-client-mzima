import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeploymentPage } from './deployment.page';

const routes: Routes = [
  {
    path: '',
    component: DeploymentPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeploymentPageRoutingModule {}
