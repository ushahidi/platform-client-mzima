import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import { AdminGuard } from '@guards';
import { UshahidiPageTitleStrategy } from '@services';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full',
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then((m) => m.MapModule),
    data: { breadcrumb: 'views.map' },
  },
  {
    path: 'data',
    loadChildren: () => import('./data/data.module').then((m) => m.DataModule),
    data: { breadcrumb: 'views.data' },
  },
  {
    path: 'feed',
    loadChildren: () => import('./feed/feed.module').then((m) => m.FeedModule),
    data: { breadcrumb: 'views.data' },
  },
  {
    path: 'activity',
    loadChildren: () => import('./activity/activity.module').then((m) => m.ActivityModule),
    data: { breadcrumb: 'views.activity' },
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [AdminGuard],
    data: { breadcrumb: 'nav.settings' },
  },
  {
    path: 'post',
    loadChildren: () => import('./post/post.module').then((m) => m.PostModule),
    data: { breadcrumb: 'post.posts' },
  },
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundComponent,
    data: { breadcrumb: 'app.page-not-found' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: UshahidiPageTitleStrategy }],
})
export class AppRoutingModule {}
