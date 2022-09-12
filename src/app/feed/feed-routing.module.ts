import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedItemComponent } from './feed-item/feed-item.component';
import { FeedComponent } from './feed.component';

const routes: Routes = [
  {
    path: '',
    component: FeedComponent,
    children: [{ path: ':id', component: FeedItemComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedRoutingModule {}
