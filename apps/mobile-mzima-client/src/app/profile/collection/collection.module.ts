import { NgModule } from '@angular/core';
import { CollectionPage } from './collection.page';
import { CollectionPageRoutingModule } from './collection-routing.module';
import { SharedModule } from '@shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CollectionPageRoutingModule, SharedModule, ReactiveFormsModule, FormsModule],
  declarations: [CollectionPage],
})
export class CollectionPageModule {}
