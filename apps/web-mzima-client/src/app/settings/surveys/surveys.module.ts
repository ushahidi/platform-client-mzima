import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { ColorPickerComponentModule } from '../../shared/components/color-picker/color-picker-component.module';
import { GroupCheckboxSelectModule } from '../../shared/components/group-checkbox-select/group-checkbox-select.module';
import { MultilevelSelectModule } from '../../shared/components/multilevel-select/multilevel-select.module';
import { SettingsHeaderModule } from '../../shared/components/settings-header/settings-header.module';
import { SpinnerModule } from '../../shared/components/spinner/spinner.module';
import { DirectiveModule } from '../../shared/directive.module';

import { SurveysRoutingModule } from './surveys-routing.module';
import { SurveysComponent } from './surveys.component';
import { SurveyItemComponent } from './survey-item/survey-item.component';
import { TranslationsSwitchModule } from '@shared';
import { SurveyTaskComponent } from './survey-task/survey-task.component';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CreateTaskModalComponent } from './create-task-modal/create-task-modal.component';
import { CreateFieldModalComponent } from './create-field-modal/create-field-modal.component';
import { ShareMenuComponent } from './share-menu/share-menu.component';
import { QuillModule } from 'ngx-quill';

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
    MatTabsModule,
    DragDropModule,
    SurveysRoutingModule,
    MatExpansionModule,
    TranslationsSwitchModule,
    QuillModule.forRoot(),
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MultilevelSelectModule,
    MatSlideToggleModule,
    SpinnerModule,
    MatRippleModule,
    ReactiveFormsModule,
    SettingsHeaderModule,
    MatSelectModule,
    GroupCheckboxSelectModule,
    ColorPickerComponentModule,
    DirectiveModule,
    MatCheckboxModule,
  ],
})
export class SurveysModule {}
