import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  DonationButtonComponent,
  MapWithMarkerComponent,
  CollectionsModalComponent,
  SnackbarComponent,
  SearchFormComponent,
  SaveSearchModalComponent,
  LocationSelectionComponent,
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
  DonationButtonComponent,
  DateAgoPipe,
  MapWithMarkerComponent,
  CollectionsModalComponent,
  SnackbarComponent,
  SearchFormComponent,
  SaveSearchModalComponent,
  FilterValuePipe,
  LocationSelectionComponent,
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
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...components, ...modules],
})
export class SharedModule {}
