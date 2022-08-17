import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurveysRoutingModule } from './surveys-routing.module';
import { SurveysComponent } from './surveys.component';

@NgModule({
  declarations: [SurveysComponent],
  imports: [CommonModule, SurveysRoutingModule],
})
export class SurveysModule {}
