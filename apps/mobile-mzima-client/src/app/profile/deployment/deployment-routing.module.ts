import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeploymentPage } from './deployment.page';

export const routes: Routes = [
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
