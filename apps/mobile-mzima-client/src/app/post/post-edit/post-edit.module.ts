import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared';
import { DateSelectModule } from '../../map/components/date-select/date-select.module';
import { PostComponentsModule } from '../components/post-components.module';
import { PostEditPage } from './post-edit.page';
import { PostEditRoutingModule } from './post-edit.routing.module';

@NgModule({
  imports: [
    PostEditRoutingModule,
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule,
    DateSelectModule,
    FormsModule,
    TextFieldModule,
    TranslateModule,
    PostComponentsModule,
  ],
  declarations: [PostEditPage],
})
export class PostEditModule {}
