import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DataRoutingModule } from './data-routing.module';
import { DataComponent } from './data.component';
import { CollectionsComponent } from './collections/collections.component';
import { SharedModule } from '../shared';

@NgModule({
  declarations: [DataComponent, CollectionsComponent],
  imports: [CommonModule, SharedModule, DataRoutingModule, TranslateModule],
})
export class DataModule {}
