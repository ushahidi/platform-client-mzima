import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataRoutingModule } from './data-routing.module';
import { DataComponent } from './data.component';
import { CollectionsComponent } from './collections/collections.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DataComponent, CollectionsComponent],
  imports: [CommonModule, SharedModule, DataRoutingModule],
})
export class DataModule {}
