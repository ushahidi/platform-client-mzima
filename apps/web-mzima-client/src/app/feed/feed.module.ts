import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { SortByFieldModule } from '@pipes';
import { SpinnerModule } from '../shared/components/spinner/spinner.module';
import { FeedComponent } from './feed.component';
import { FeedRoutingModule } from './feed-routing.module';
import { PostModule } from '../post/post.module';
import { NgxMasonryModule } from 'ngx-masonry';
import { NgxPaginationModule } from 'ngx-pagination';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

@NgModule({
  declarations: [FeedComponent],
  imports: [
    CommonModule,
    FeedRoutingModule,
    PostModule,
    NgxMasonryModule,
    NgxPaginationModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    TranslateModule,
    SpinnerModule,
    FormsModule,
    MzimaUiModule,
    SortByFieldModule,
    ReactiveFormsModule,
  ],
})
export class FeedModule {}
