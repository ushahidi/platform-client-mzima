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
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { TranslateModule } from '@ngx-translate/core';

const components = [
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  BreadcrumbComponent,
  FileUploaderComponent,
  SubmitPostButtonComponent,
  DialogComponent,
  LanguageComponent,
  SpinnerComponent,
  ConfirmModalComponent,
];

const modules = [
  CommonModule,
  MaterialModule,
  ReactiveFormsModule,
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
