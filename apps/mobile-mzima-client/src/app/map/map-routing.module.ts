import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapPage } from './map.page';

const routes: Routes = [
  {
    path: '',
    component: MapPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class MapPageRoutingModule {}
