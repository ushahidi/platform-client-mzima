import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditFeedItemComponent } from './edit-feed-item/edit-feed-item.component';
import { FeedComponent } from './feed.component';

const routes: Routes = [
  {
    path: '',
    component: FeedComponent,
    children: [{ path: ':id/edit', component: EditFeedItemComponent }],
  },
  { path: 'collection', redirectTo: '' },
  {
    path: 'collection/:id',
    component: FeedComponent,
    data: {
      view: 'collection',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedRoutingModule {}
