import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
} from '@angular-material-components/datetime-picker';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { SortByFieldModule } from '@pipes';
import { DirectiveModule, MapWithMarkerModule, PipeModule, SpinnerModule } from '@shared';
import { PostRoutingModule } from './post-routing.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { PostEditComponent } from './post-edit/post-edit.component';
import { LocationSelectComponent } from './location-select/location-select.component';
import { PostPreviewComponent } from './post-preview/post-preview.component';
import { PostDetailsComponent } from './post-details/post-details.component';
import { PostMetadataComponent } from './post-metadata/post-metadata.component';
import { TwitterWidgetComponent } from './twitter-widget/twitter-widget.component';
import { PostHeadComponent } from './post-head/post-head.component';
import { MzimaUiModule } from '@mzima-client/mzima-ui';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PostNotFoundComponent } from './post-not-found/post-not-found.component';

@NgModule({
  declarations: [
    PostEditComponent,
    LocationSelectComponent,
    PostPreviewComponent,
    PostDetailsComponent,
    PostMetadataComponent,
    TwitterWidgetComponent,
    PostHeadComponent,
    ImageUploaderComponent,
    PostNotFoundComponent,
  ],
  imports: [
    CommonModule,
    PostRoutingModule,
    LeafletModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    SpinnerModule,
    MatRippleModule,
    DirectiveModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatGridListModule,
    FormsModule,
    MapWithMarkerModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
    NgxMatDatetimePickerModule,
    MatRadioModule,
    MatListModule,
    MatSelectModule,
    MatMenuModule,
    PipeModule,
    NgxMatNativeDateModule,
    MzimaUiModule,
    SortByFieldModule,
  ],
  exports: [
    PostPreviewComponent,
    PostDetailsComponent,
    PostMetadataComponent,
    PostEditComponent,
    PostNotFoundComponent,
  ],
})
export class PostModule {}
