import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateSurveyComponent } from './create-survey/create-survey.component';

import { SurveysComponent } from './surveys.component';

const routes: Routes = [
  { path: '', component: SurveysComponent },
  { path: 'create', component: CreateSurveyComponent, data: { breadcrumb: 'Create' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule {}
