import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LanguageGuard, NotDeploymentGuard, WalkthroughGuard } from '@guards';
import { MapPage } from './map.page';

const routes: Routes = [
  {
    path: '',
    component: MapPage,
    canActivate: [LanguageGuard, WalkthroughGuard, NotDeploymentGuard],
  },
  {
    path: 'collection',
    redirectTo: '',
    children: [
      {
        path: ':id',
        component: MapPage,
        data: {
          view: 'collection',
        },
      },
    ],
  },
  {
    path: 'search',
    redirectTo: '',
    children: [
      {
        path: ':id',
        component: MapPage,
        data: {
          view: 'search',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class MapPageRoutingModule {}
