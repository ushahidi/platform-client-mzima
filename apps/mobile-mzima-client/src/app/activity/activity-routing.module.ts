import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityPage } from './activity.page';

const routes: Routes = [
  {
    path: '',
    component: ActivityPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ActivityPageRoutingModule {}
