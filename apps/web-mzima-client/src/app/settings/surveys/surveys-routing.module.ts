import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyItemComponent } from './survey-item/survey-item.component';

import { SurveysComponent } from './surveys.component';
import { DeactivateGuardService } from '../../core/guards/deactivate-settings-route.guard';

const routes: Routes = [
  { path: '', component: SurveysComponent },
  {
    path: 'create',
    component: SurveyItemComponent,
    canDeactivate: [DeactivateGuardService],
    data: { breadcrumb: 'survey.create_survey' },
  },
  {
    path: 'update/:id',
    component: SurveyItemComponent,
    canDeactivate: [DeactivateGuardService],
    data: { breadcrumb: 'survey.update_survey' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule {}
