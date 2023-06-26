import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { SharedModule } from '@shared';
import { TruncateModule } from '../../core/pipes';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';
import { LocationSelectComponent } from './location-select/location-select.component';

const components = [ImageUploaderComponent, LocationSelectComponent];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    LeafletModule,
    FormsModule,
    TruncateModule,
  ],
  declarations: [...components],
  exports: [...components],
})
export class PostComponentsModule {}
