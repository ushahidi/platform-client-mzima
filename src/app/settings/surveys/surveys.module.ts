import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

import { SurveysRoutingModule } from './surveys-routing.module';
import { SurveysComponent } from './surveys.component';
import { SurveyItemComponent } from './survey-item/survey-item.component';
import { SharedModule, TranslationsSwitchModule } from '@shared';

@NgModule({
  declarations: [SurveysComponent, SurveyItemComponent],
  imports: [
    CommonModule,
    SharedModule,
    SurveysRoutingModule,
    MatExpansionModule,
    TranslationsSwitchModule,
  ],
})
export class SurveysModule {}
