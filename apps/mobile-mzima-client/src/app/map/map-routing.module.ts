import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotDeploymentGuard, WalkthroughGuard } from '@guards';
import { MapPage } from './map.page';

const routes: Routes = [
  {
    path: '',
    component: MapPage,
    canActivate: [WalkthroughGuard, NotDeploymentGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class MapPageRoutingModule {}
