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
    data: { breadcrumb: 'Map view' },
  },
  {
    path: 'data',
    title: 'post.posts',
    loadChildren: () => import('./data/data.module').then((m) => m.DataModule),
    data: { breadcrumb: 'Data' },
  },
  {
    path: 'feed',
    title: 'post.posts',
    loadChildren: () => import('./feed/feed.module').then((m) => m.FeedModule),
    data: { breadcrumb: 'Feed' },
  },
  {
    path: 'activity',
    title: 'nav.activity',
    loadChildren: () => import('./activity/activity.module').then((m) => m.ActivityModule),
    data: { breadcrumb: 'Activity' },
  },
  {
    path: 'settings',
    title: 'tool.settings',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [AdminGuard],
    data: { breadcrumb: 'Settings' },
  },
  {
    path: 'post',
    title: 'post.posts',
    loadChildren: () => import('./post/post.module').then((m) => m.PostModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: UshahidiPageTitleStrategy }],
})
export class AppRoutingModule {}
