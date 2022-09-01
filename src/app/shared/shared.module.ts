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
  FileUploaderComponent,
  CreateCategoryFormComponent,
  SelectLanguagesModalComponent,
  CategoryItemComponent,
  SpinnerComponent,
  ConfirmModalComponent,
  LanguageComponent,
} from './components';
import { MaterialModule } from './material.module';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { TranslateModule } from '@ngx-translate/core';

const components = [
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  BreadcrumbComponent,
  FileUploaderComponent,
  SubmitPostButtonComponent,
  LanguageComponent,
  SpinnerComponent,
  ConfirmModalComponent,
  CreateCategoryFormComponent,
  SelectLanguagesModalComponent,
  CategoryItemComponent,
  SpinnerComponent,
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
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...components, ...modules],
})
export class SharedModule {}
