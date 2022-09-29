import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurveysRoutingModule } from './surveys-routing.module';
import { SurveysComponent } from './surveys.component';
import { CreateSurveyComponent } from './create-survey/create-survey.component';
import { SharedModule } from '@shared';
import { SurveyTaskComponent } from './survey-task/survey-task.component';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CreateTaskModalComponent } from './create-task-modal/create-task-modal.component';
import { CreateFieldModalComponent } from './create-field-modal/create-field-modal.component';

@NgModule({
  declarations: [
    SurveysComponent,
    CreateSurveyComponent,
    SurveyTaskComponent,
    CreateTaskModalComponent,
    CreateFieldModalComponent,
  ],
  imports: [CommonModule, SharedModule, MatTabsModule, DragDropModule, SurveysRoutingModule],
})
export class SurveysModule {}
