import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared';

import { DataSourcesRoutingModule } from './data-sources-routing.module';
import { DataSourcesComponent } from './data-sources.component';
import { DataSourceItemComponent } from './data-source-item/data-source-item.component';

@NgModule({
  declarations: [DataSourcesComponent, DataSourceItemComponent],
  imports: [CommonModule, DataSourcesRoutingModule, SharedModule],
})
export class DataSourcesModule {}
