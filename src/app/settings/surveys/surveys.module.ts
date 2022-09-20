import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurveysRoutingModule } from './surveys-routing.module';
import { SurveysComponent } from './surveys.component';
import { CreateSurveyComponent } from './create-survey/create-survey.component';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [SurveysComponent, CreateSurveyComponent],
  imports: [CommonModule, SharedModule, SurveysRoutingModule],
})
export class SurveysModule {}
