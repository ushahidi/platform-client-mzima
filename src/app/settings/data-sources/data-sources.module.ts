import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '@shared';

import { DataSourcesRoutingModule } from './data-sources-routing.module';
import { DataSourcesComponent } from './data-sources.component';
import { DataSourceFormComponent } from './data-source-form/data-source-form.component';

@NgModule({
  declarations: [DataSourcesComponent, DataSourceFormComponent],
  imports: [
    CommonModule,
    DataSourcesRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    TranslateModule,
  ],
})
export class DataSourcesModule {}
