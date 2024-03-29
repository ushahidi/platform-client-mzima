import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  FormControlComponent,
  IconComponent,
  CheckboxComponent,
  ButtonComponent,
  ModalComponent,
  PageNotFoundComponent,
  MenuComponent,
  SpinnerComponent,
  RadioComponent,
  SelectComponent,
  CalendarComponent,
  HeaderComponent,
  MainLayoutComponent,
  CollectionsModalComponent,
  ToggleComponent,
  GroupCheckboxSelectComponent,
  DeploymentInfoComponent,
  PasswordStrengthComponent,
  SearchFormComponent,
  ChooseDeploymentComponent,
  DeploymentItemComponent,
  ChooseCollectionComponent,
  CollectionItemComponent,
  PostControlsComponent,
} from './components';
import { CalendarModule } from 'ion2-calendar';
import { TextareaControlComponent } from './components/textarea-control/textarea-control.component';
import { TruncateModule } from '@pipes';

const components = [
  IconComponent,
  FormControlComponent,
  CheckboxComponent,
  ButtonComponent,
  ModalComponent,
  PageNotFoundComponent,
  MenuComponent,
  SpinnerComponent,
  RadioComponent,
  SelectComponent,
  CalendarComponent,
  HeaderComponent,
  MainLayoutComponent,
  CollectionsModalComponent,
  ToggleComponent,
  GroupCheckboxSelectComponent,
  TextareaControlComponent,
  DeploymentInfoComponent,
  PasswordStrengthComponent,
  SearchFormComponent,
  DeploymentItemComponent,
  ChooseDeploymentComponent,
  ChooseCollectionComponent,
  CollectionItemComponent,
  PostControlsComponent,
];

@NgModule({
  declarations: [...components],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterModule,
    FormsModule,
    CalendarModule,
    ReactiveFormsModule,
    TruncateModule,
  ],
  exports: [IonicModule, CommonModule, ...components],
})
export class SharedModule {}
