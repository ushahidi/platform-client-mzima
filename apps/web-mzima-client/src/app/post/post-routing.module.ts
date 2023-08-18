import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RedirectGuard } from '../core/guards/redirect.guard';
import { PostEditComponent } from './post-edit/post-edit.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/feed',
  },
  {
    path: 'create/:type',
    component: PostEditComponent,
    data: { breadcrumb: 'Create Post' },
  },
  {
    path: ':id/edit',
    canActivate: [RedirectGuard],
    component: PostEditComponent,
    data: { breadcrumb: 'Edit Post', edit: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostRoutingModule {}
