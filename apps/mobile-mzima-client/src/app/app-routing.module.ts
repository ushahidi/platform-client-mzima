import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NotAuthorizedGuard } from '@guards';
import { PageNotFoundComponent } from '@components';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./map/map.module').then((m) => m.MapPageModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthPageModule),
    canActivate: [NotAuthorizedGuard],
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
  {
    path: 'walkthrough',
    loadChildren: () =>
      import('./walkthrough/walkthrough.module').then((m) => m.WalkthroughPageModule),
  },
  {
    path: 'deployment',
    loadChildren: () =>
      import('./deployment/deployment.module').then((m) => m.DeploymentPageModule),
  },
  {
    path: 'post-edit',
    loadChildren: () => import('./post/post-edit/post-edit.module').then((m) => m.PostEditModule),
    data: {
      breadcrumb: 'nav.posts',
      ogTitle: 'nav.posts',
    },
  },
  {
    path: 'terms-and-conditions',
    loadChildren: () =>
      import('./terms-and-conditions/terms-and-conditions.module').then(
        (m) => m.TermsAndConditionsPageModule,
      ),
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('./privacy-policy/privacy-policy.module').then((m) => m.PrivacyPolicyPageModule),
  },
  {
    path: 'activity',
    loadChildren: () => import('./activity/activity.module').then((m) => m.ActivityPageModule),
  },
  {
    path: ':id',
    loadChildren: () => import('./post/post.module').then((m) => m.PostPageModule),
  },
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundComponent,
    data: {
      breadcrumb: 'app.page-not-found',
      ogTitle: 'app.page-not-found',
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
