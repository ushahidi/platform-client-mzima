import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyItemComponent } from './survey-item/survey-item.component';

import { SurveysComponent } from './surveys.component';

const routes: Routes = [
  { path: '', component: SurveysComponent },
  { path: 'create', component: SurveyItemComponent, data: { breadcrumb: 'Create survey' } },
  { path: 'update/:id', component: SurveyItemComponent, data: { breadcrumb: 'Update survey' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule {}
