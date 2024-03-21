import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { SharedModule } from '@shared';
import { SortByFieldModule, TruncateModule, PrependUrlModule } from '@pipes';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';
import { LocationControlModule } from './location-control/location-control.module';
import { LocationSelectComponent } from './location-select/location-select.component';
import { OfflineNotificationComponent } from './offline-notification/offline-notification.component';
import { PostContentComponent } from './post-content/post-content.component';

const components = [
  ImageUploaderComponent,
  LocationSelectComponent,
  PostContentComponent,
  OfflineNotificationComponent,
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    LeafletModule,
    FormsModule,
    TruncateModule,
    PrependUrlModule,
    LocationControlModule,
    SortByFieldModule,
    MatIconModule,
  ],
  declarations: [...components],
  exports: [...components],
})
export class PostComponentsModule {}
