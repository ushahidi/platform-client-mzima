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

const components = [
  SidebarComponent,
  ToolbarComponent,
  LogoComponent,
  BreadcrumbComponent,
  FileUploaderComponent,
];

const modules = [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule, RouterModule];

@NgModule({
  declarations: [...components, DialogComponent],
  imports: [...modules],
  exports: [...components, ...modules],
})
export class SharedModule {}
