import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  PostDetailsComponent,
  PostEditComponent,
  PostNotAllowedComponent,
  PostNotFoundComponent,
} from '@post';
import { FeedComponent } from './feed.component';
import { RedirectByPostIdGuard } from '../core/guards/redirect.post-id.guard';

/* -------------------------------------------------------
  RedirectByPostIdGuard added here to all child :id routes
  And also added to the parent posts:id in the app-routing
  module file
--------------------------------------------------------*/

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
        canActivate: [RedirectByPostIdGuard],
        data: {
          ogTitle: 'nav.feed',
        },
      },
      {
        path: ':id/edit',
        component: PostEditComponent,
        canActivate: [RedirectByPostIdGuard],
        data: {
          ogTitle: 'nav.feed',
        },
      },
      {
        path: ':id/not-found',
        component: PostNotFoundComponent,
      },
      {
        path: ':id/not-allowed',
        component: PostNotAllowedComponent,
      },
    ],
  },
  {
    path: 'collection',
    redirectTo: '',
    // canActivate: [RedirectByPostIdGuard], (i can't get collection ID through this means to use within the guard, so... commenting out)
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
            canActivate: [RedirectByPostIdGuard],
            data: {
              ogTitle: 'nav.feed',
            },
          },
          {
            path: ':id/edit',
            component: PostEditComponent,
            canActivate: [RedirectByPostIdGuard],
            data: {
              ogTitle: 'nav.feed',
            },
          },
          {
            path: ':id/not-found',
            component: PostNotFoundComponent,
          },
          {
            path: ':id/not-allowed',
            component: PostNotAllowedComponent,
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
