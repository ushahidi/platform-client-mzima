import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  BreadcrumbComponent,
  FileUploaderComponent,
  SubmitPostButtonComponent,
} from './components';
import { MaterialModule } from './material.module';
import { DialogComponent } from './components/dialog/dialog.component';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';

const components = [
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  DialogComponent,
  BreadcrumbComponent,
  FileUploaderComponent,
  SubmitPostButtonComponent,
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
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...components, ...modules],
})
export class SharedModule {}
