import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyItemComponent } from './survey-item/survey-item.component';

import { SurveysComponent } from './surveys.component';

const routes: Routes = [
  { path: '', component: SurveysComponent },
  { path: 'create', component: SurveyItemComponent, data: { breadcrumb: 'survey.create_survey' } },
  {
    path: 'update/:id',
    component: SurveyItemComponent,
    data: { breadcrumb: 'survey.update_survey' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule {}
