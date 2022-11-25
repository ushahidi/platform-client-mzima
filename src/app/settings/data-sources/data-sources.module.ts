import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '@shared';

import { DataSourcesRoutingModule } from './data-sources-routing.module';
import { DataSourcesComponent } from './data-sources.component';
import { DataSourceItemComponent } from './data-source-item/data-source-item.component';

@NgModule({
  declarations: [DataSourcesComponent, DataSourceItemComponent],
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
