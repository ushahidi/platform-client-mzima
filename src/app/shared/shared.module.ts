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
} from './components';
import { MaterialModule } from './material.module';
import { DialogComponent } from './components/dialog/dialog.component';
import { LanguageComponent } from './components/language/language.component';

const components = [
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  BreadcrumbComponent,
  FileUploaderComponent,
];

const modules = [CommonModule, MaterialModule, ReactiveFormsModule, RouterModule];

@NgModule({
  declarations: [...components, DialogComponent, LanguageComponent],
  imports: [...modules, FormsModule],
  exports: [...components, ...modules],
})
export class SharedModule {}
