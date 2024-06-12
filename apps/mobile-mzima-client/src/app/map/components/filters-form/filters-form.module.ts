import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersFormComponent } from './filters-form.component';
import { IonicModule } from '@ionic/angular';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared';
import { PostItemModule } from '../post-item/post-item.module';
import { FilterControlModule } from '../filter-control/filter-control.module';
import { FilterModule } from '../filter/filter.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [FiltersFormComponent],
  imports: [
    CommonModule,
    IonicModule,
    LeafletModule,
    ReactiveFormsModule,
    SharedModule,
    PostItemModule,
    FilterControlModule,
    FilterModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
  ],
  exports: [FiltersFormComponent],
})
export class FiltersFormModule {}
