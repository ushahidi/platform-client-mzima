import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  PostDetailsComponent,
  PostEditComponent,
  PostNotAllowedComponent,
  PostNotFoundComponent,
} from '@post';
import { FeedComponent } from './feed.component';
import { PostResolver } from '../core/resolvers/post-resolver';
/* -------------------------------------------------------
  PostResolver added here to all child :id routes
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
        resolve: { post: PostResolver },
        data: {
          ogTitle: 'nav.feed',
        },
        runGuardsAndResolvers: 'always',
      },
      {
        path: ':id/edit',
        component: PostEditComponent,
        resolve: { post: PostResolver },
        data: {
          ogTitle: 'nav.feed',
        },
        runGuardsAndResolvers: 'always',
      },
      {
        path: ':id/not-found',
        component: PostNotFoundComponent,
        data: {
          ogTitle: 'nav.feed',
        },
      },
      {
        path: ':id/not-allowed',
        component: PostNotAllowedComponent,
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
            resolve: { post: PostResolver },
            data: {
              ogTitle: 'nav.feed',
            },
            runGuardsAndResolvers: 'always',
          },
          {
            path: ':id/edit',
            component: PostEditComponent,
            resolve: { post: PostResolver },
            data: {
              ogTitle: 'nav.feed',
            },
            runGuardsAndResolvers: 'always',
          },
          {
            path: ':id/not-found',
            component: PostNotFoundComponent,
            data: {
              ogTitle: 'nav.feed',
            },
          },
          {
            path: ':id/not-allowed',
            component: PostNotAllowedComponent,
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
