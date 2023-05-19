import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFormComponent } from './search-form.component';
import { IonicModule } from '@ionic/angular';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [SearchFormComponent],
  imports: [CommonModule, IonicModule, LeafletModule, ReactiveFormsModule, SharedModule],
  exports: [SearchFormComponent],
})
export class SearchFormModule {}
