import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFormComponent } from './search-form.component';
import { IonicModule } from '@ionic/angular';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared';
import { PostItemModule } from '../post-item/post-item.module';
import { FilterControlModule } from '../filter-control/filter-control.module';
import { FilterModule } from '../filter/filter.module';

@NgModule({
  declarations: [SearchFormComponent],
  imports: [
    CommonModule,
    IonicModule,
    LeafletModule,
    ReactiveFormsModule,
    SharedModule,
    PostItemModule,
    FilterControlModule,
    FilterModule,
  ],
  exports: [SearchFormComponent],
})
export class SearchFormModule {}
