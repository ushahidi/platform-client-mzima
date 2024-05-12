import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostDetailsComponent, PostEditComponent } from '@post';
import { FeedComponent } from './feed.component';

const routes: Routes = [
  {
    path: '',
    component: FeedComponent,
    children: [
      //--- Prevents reload of children components where/when necessary
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
      },
      //----------------------------
      {
        path: ':id/view',
        component: PostDetailsComponent,
        data: {
          ogTitle: 'nav.feed',
        },
      },
      {
        path: ':id/edit',
        component: PostEditComponent,
        data: {
          ogTitle: 'nav.feed',
        },
      },
    ],
  },
  {
    path: 'collection',
    redirectTo: '',
    children: [
      {
        path: ':id',
        component: FeedComponent,
        data: {
          view: 'collection',
        },
        children: [
          {
            path: ':id/view',
            component: PostDetailsComponent,
            data: {
              ogTitle: 'nav.feed',
            },
          },
          {
            path: ':id/edit',
            component: PostEditComponent,
            data: {
              ogTitle: 'nav.feed',
            },
          },
        ],
      },
    ],
  },
  {
    path: 'search',
    redirectTo: '',
    children: [
      {
        path: ':id',
        component: FeedComponent,
        data: {
          view: 'search',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedRoutingModule {}
