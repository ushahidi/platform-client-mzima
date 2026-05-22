import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LanguageGuard, NotAuthorizedGuard } from '@guards';
import { PageNotFoundComponent } from '@components';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./map/map.module').then((m) => m.MapPageModule),
  },
  {
    path: 'language',
    loadChildren: () => import('./language/language.module').then((m) => m.LanguagePageModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthPageModule),
    canActivate: [LanguageGuard, NotAuthorizedGuard],
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then((m) => m.ProfilePageModule),
    canActivate: [LanguageGuard],
  },
  {
    path: 'walkthrough',
    loadChildren: () =>
      import('./walkthrough/walkthrough.module').then((m) => m.WalkthroughPageModule),
    canActivate: [LanguageGuard],
  },
  {
    path: 'deployment',
    loadChildren: () =>
      import('./deployment/deployment.module').then((m) => m.DeploymentPageModule),
    canActivate: [LanguageGuard],
  },
  {
    path: 'post-edit',
    loadChildren: () => import('./post/post-edit/post-edit.module').then((m) => m.PostEditModule),
    canActivate: [LanguageGuard],
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
    canActivate: [LanguageGuard],
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('./privacy-policy/privacy-policy.module').then((m) => m.PrivacyPolicyPageModule),
    canActivate: [LanguageGuard],
  },
  {
    path: 'activity',
    loadChildren: () => import('./activity/activity.module').then((m) => m.ActivityPageModule),
    canActivate: [LanguageGuard],
  },
  {
    path: ':id',
    loadChildren: () => import('./post/post.module').then((m) => m.PostPageModule),
    canActivate: [LanguageGuard],
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
