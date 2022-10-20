import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GtmDirective } from '../core/directives/gtm.directive';

import {
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  BreadcrumbComponent,
  SubmitPostButtonComponent,
  SelectLanguagesModalComponent,
  SpinnerComponent,
  ConfirmModalComponent,
  LanguageComponent,
  MapWithMarkerComponent,
  CollectionsModalComponent,
  SnackbarComponent,
  SearchFormComponent,
  SaveSearchModalComponent,
  LocationSelectionComponent,
  AccountSettingsComponent,
  MultilevelSelectComponent,
  GroupCheckboxSelectComponent,
  ColorPickerComponent,
  CompanyInfoComponent,
  FilterControlComponent,
} from './components';
import { MaterialModule } from './material/material.module';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { TranslateModule } from '@ngx-translate/core';
import { DateAgoPipe, FilterValuePipe } from '@pipes';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ColorPickerModule } from 'ngx-color-picker';

const components = [
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  BreadcrumbComponent,
  SubmitPostButtonComponent,
  LanguageComponent,
  SpinnerComponent,
  ConfirmModalComponent,
  SelectLanguagesModalComponent,
  DateAgoPipe,
  MapWithMarkerComponent,
  CollectionsModalComponent,
  SnackbarComponent,
  SearchFormComponent,
  SaveSearchModalComponent,
  FilterValuePipe,
  LocationSelectionComponent,
  GtmDirective,
  AccountSettingsComponent,
  MultilevelSelectComponent,
  GroupCheckboxSelectComponent,
  ColorPickerComponent,
  CompanyInfoComponent,
  FilterControlComponent,
];

const modules = [
  CommonModule,
  MaterialModule,
  ReactiveFormsModule,
  FormsModule,
  RouterModule,
  NgxMatTimepickerModule,
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  FormsModule,
  TranslateModule,
  LeafletModule,
  ColorPickerModule,
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...components, ...modules],
})
export class SharedModule {}
