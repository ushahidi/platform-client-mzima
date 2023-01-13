import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map.component';

const routes: Routes = [
  { path: '', component: MapComponent },
  {
    path: 'collection',
    redirectTo: '',
    children: [
      {
        path: ':id',
        component: MapComponent,
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
        component: MapComponent,
        data: {
          view: 'search',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapRoutingModule {}
