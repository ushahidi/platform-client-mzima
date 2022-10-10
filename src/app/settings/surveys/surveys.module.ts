import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

import { SurveysRoutingModule } from './surveys-routing.module';
import { SurveysComponent } from './surveys.component';
import { SurveyItemComponent } from './survey-item/survey-item.component';
import { SharedModule, TranslationsSwitchModule } from '@shared';
import { SurveyTaskComponent } from './survey-task/survey-task.component';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CreateTaskModalComponent } from './create-task-modal/create-task-modal.component';
import { CreateFieldModalComponent } from './create-field-modal/create-field-modal.component';
import { ShareMenuComponent } from './share-menu/share-menu.component';

@NgModule({
  declarations: [
    SurveysComponent,
    SurveyItemComponent,
    SurveyTaskComponent,
    CreateTaskModalComponent,
    CreateFieldModalComponent,
    ShareMenuComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTabsModule,
    DragDropModule,
    SurveysRoutingModule,
    MatExpansionModule,
    TranslationsSwitchModule,
  ],
})
export class SurveysModule {}
