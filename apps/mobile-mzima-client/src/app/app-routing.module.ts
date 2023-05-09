import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthPageModule),
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
