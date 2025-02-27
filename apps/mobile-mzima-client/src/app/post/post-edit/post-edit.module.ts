import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SortByFieldModule } from '@pipes';
import { SharedModule } from '@shared';
import { DateSelectModule } from '../../map/components/date-select/date-select.module';
import { PostComponentsModule } from '../components/post-components.module';
import { PostEditPage } from './post-edit.page';
import { PostEditRoutingModule } from './post-edit.routing.module';
import { MediaUploaderComponent } from '../components/media-uploader/media-uploader.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    PostEditRoutingModule,
    CommonModule,
    IonicModule,
    MatIconModule,
    ReactiveFormsModule,
    SharedModule,
    DateSelectModule,
    FormsModule,
    TextFieldModule,
    TranslateModule,
    PostComponentsModule,
    SortByFieldModule,
    TranslateModule,
    MatProgressBarModule,
  ],
  declarations: [PostEditPage, MediaUploaderComponent],
})
export class PostEditModule {}
