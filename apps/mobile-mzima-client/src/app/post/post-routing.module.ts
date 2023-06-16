import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostPage } from './post.page';
import { WalkthroughGuard } from '../core/guards/walkthrough.guard';
import { NotDeploymentGuard } from '../core/guards/not-deployment.guard';

const routes: Routes = [
  {
    path: '',
    component: PostPage,
    canActivate: [WalkthroughGuard, NotDeploymentGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class PostPageRoutingModule {}
