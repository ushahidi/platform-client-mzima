import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

import { SurveysRoutingModule } from './surveys-routing.module';
import { SurveysComponent } from './surveys.component';
import { CreateSurveyComponent } from './create-survey/create-survey.component';
import { SharedModule, TranslationsSwitchModule } from '@shared';

@NgModule({
  declarations: [SurveysComponent, CreateSurveyComponent],
  imports: [
    CommonModule,
    SharedModule,
    SurveysRoutingModule,
    MatExpansionModule,
    TranslationsSwitchModule,
  ],
})
export class SurveysModule {}
