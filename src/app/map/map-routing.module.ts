import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map.component';

const routes: Routes = [
  { path: '', component: MapComponent },
  { path: 'collection', redirectTo: '' },
  {
    path: 'collection/:id',
    component: MapComponent,
    data: {
      view: 'collection',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapRoutingModule {}
