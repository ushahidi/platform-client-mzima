import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import { AdminGuard } from '@guards';
import { UshahidiPageTitleStrategy } from '@services';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full',
  },
  {
    path: 'map',
    title: 'post.posts',
    loadChildren: () => import('./map/map.module').then((m) => m.MapModule),
    data: { breadcrumb: 'views.map' },
  },
  {
    path: 'data',
    title: 'post.posts',
    loadChildren: () => import('./data/data.module').then((m) => m.DataModule),
    data: { breadcrumb: 'views.data' },
  },
  {
    path: 'feed',
    title: 'post.posts',
    loadChildren: () => import('./feed/feed.module').then((m) => m.FeedModule),
    data: { breadcrumb: 'views.data' },
  },
  {
    path: 'activity',
    title: 'nav.activity',
    loadChildren: () => import('./activity/activity.module').then((m) => m.ActivityModule),
    data: { breadcrumb: 'views.activity' },
  },
  {
    path: 'settings',
    title: 'tool.settings',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [AdminGuard],
    data: { breadcrumb: 'nav.settings' },
  },
  {
    path: 'post',
    title: 'post.posts',
    loadChildren: () => import('./post/post.module').then((m) => m.PostModule),
  },
  {
    path: 'reset',
    title: 'reset',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    data: { breadcrumb: 'nav.resetpassword' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: UshahidiPageTitleStrategy }],
})
export class AppRoutingModule {}
