import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataSourcesRoutingModule } from './data-sources-routing.module';
import { DataSourcesComponent } from './data-sources.component';

@NgModule({
  declarations: [DataSourcesComponent],
  imports: [CommonModule, DataSourcesRoutingModule],
})
export class DataSourcesModule {}
