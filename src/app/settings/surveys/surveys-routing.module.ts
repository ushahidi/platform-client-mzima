import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SurveysComponent } from './surveys.component';

const routes: Routes = [{ path: '', component: SurveysComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule {}
