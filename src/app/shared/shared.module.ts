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
} from './components';
import { MaterialModule } from './material.module';
import { DialogComponent } from './components';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { LanguageComponent } from './components/language/language.component';

const components = [
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  DialogComponent,
  BreadcrumbComponent,
  FileUploaderComponent,
  SubmitPostButtonComponent,
  DialogComponent,
  LanguageComponent,
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
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...components, ...modules],
})
export class SharedModule {}
