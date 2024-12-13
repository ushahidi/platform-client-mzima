import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import {
  HostGuard,
  AccessDeniedGuard,
  DeploymentFoundGuard,
  ResetTokenGuard,
  AccessAllowGuard,
  RedirectGuard,
} from '@guards';
import { PageNotFoundComponent } from './shared/components';
import { UshahidiPageTitleStrategy } from '@services';
import { AccessDeniedComponent } from './shared/components/access-denied/access-denied.component';
import { PostNotFoundComponent } from './post/post-not-found/post-not-found.component';
import { PostNotAllowedComponent } from './post/post-not-allowed/post-not-allowed.component';
import { PostResolver } from './core/resolvers/post-resolver';
import { DeploymentNotFoundComponent } from './shared/components/deployment-not-found/deployment-not-found.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full',
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then((m) => m.MapModule),
    canActivate: [AccessDeniedGuard, DeploymentFoundGuard],
    data: {
      breadcrumb: 'nav.map',
      ogTitle: 'nav.map',
    },
  },
  {
    path: 'feed',
    loadChildren: () => import('./feed/feed.module').then((m) => m.FeedModule),
    canActivate: [AccessDeniedGuard, DeploymentFoundGuard],
    data: {
      breadcrumb: 'nav.feed',
      ogTitle: 'nav.feed',
    },
  },
  {
    path: 'activity',
    loadChildren: () => import('./activity/activity.module').then((m) => m.ActivityModule),
    canActivate: [AccessDeniedGuard, DeploymentFoundGuard],
    data: {
      breadcrumb: 'nav.activity',
      ogTitle: 'nav.activity',
    },
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [HostGuard, AccessDeniedGuard, DeploymentFoundGuard],
    data: {
      breadcrumb: 'nav.settings',
      ogTitle: 'nav.settings',
    },
  },
  {
    path: 'reset',
    title: 'reset',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    data: {
      breadcrumb: 'nav.resetpassword',
      ogTitle: 'nav.resetpassword',
    },
  },
  {
    path: 'forgotpassword/confirm/:token',
    canActivate: [ResetTokenGuard],
    component: PageNotFoundComponent,
  },
  {
    path: 'forbidden',
    component: AccessDeniedComponent,
    canActivate: [AccessAllowGuard],
    data: {
      breadcrumb: 'nav.forbidden',
      ogTitle: 'nav.forbidden',
    },
  },
  {
    path: 'notfound',
    component: DeploymentNotFoundComponent,
    // canActivate: [AccessAllowGuard],
    data: {
      breadcrumb: 'nav.deployment_not_found',
      ogTitle: 'nav.deployment_not_found',
    },
  },
  {
    path: 'views',
    children: [
      {
        path: 'map',
        redirectTo: '/map',
      },
      {
        path: 'data',
        redirectTo: '/feed',
      },
    ],
  },
  {
    path: 'post',
    loadChildren: () => import('./post/post.module').then((m) => m.PostModule),
    canActivate: [AccessDeniedGuard, DeploymentFoundGuard],
    data: {
      breadcrumb: 'nav.posts',
      ogTitle: 'nav.posts',
    },
  },
  {
    path: 'posts', // For support legacy URL routes
    loadChildren: () => import('./post/post.module').then((m) => m.PostModule),
    canActivate: [AccessDeniedGuard, DeploymentFoundGuard],
    data: {
      breadcrumb: 'nav.posts',
      ogTitle: 'nav.posts',
    },
  },
  /* -----------------------------------------------------
    RedirectByPostIdGuard added here to posts:id as parent
    And also added to all child :id routes in feed-routing
    module file
  ------------------------------------------------------*/
  {
    path: 'posts/:id',
    canActivate: [RedirectGuard, PostResolver],
    component: PostNotFoundComponent,
  },
  {
    path: 'posts/:id',
    canActivate: [RedirectGuard, PostResolver],
    component: PostNotAllowedComponent,
  },
  //-------------------------------------------
  {
    path: 'not-found',
    component: PageNotFoundComponent,
    data: {
      breadcrumb: 'app.page-not-found',
      ogTitle: 'app.page-not-found',
    },
  },
  {
    path: '**',
    pathMatch: 'full',
    canActivate: [AccessDeniedGuard],
    component: PageNotFoundComponent,
    data: {
      breadcrumb: 'app.page-not-found',
      ogTitle: 'app.page-not-found',
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: UshahidiPageTitleStrategy }],
})
export class AppRoutingModule {}
