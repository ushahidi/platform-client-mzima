import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostPage } from './post.page';
import { WalkthroughGuard, NotDeploymentGuard } from '@guards';

const routes: Routes = [
  {
    path: '',
    component: PostPage,
    canActivate: [WalkthroughGuard, NotDeploymentGuard],
  },
  {
    path: 'edit',
    loadChildren: () => import('./post-edit/post-edit.module').then((m) => m.PostEditModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class PostPageRoutingModule {}
