import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule } from '@shared';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { PostDetailsModalComponent } from './post-details-modal/post-details-modal.component';
import { PostModule } from '../post/post.module';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

@NgModule({
  declarations: [MapComponent, PostDetailsModalComponent],
  imports: [
    CommonModule,
    MapRoutingModule,
    PostModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    LeafletModule,
    TranslateModule,
    DirectiveModule,
    MzimaUiModule,
  ],
})
export class MapModule {}
