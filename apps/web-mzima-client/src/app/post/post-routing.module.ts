import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RedirectGuard } from '../core/guards/redirect.guard';
import { PostEditComponent } from './post-edit/post-edit.component';

const routes: Routes = [
  {
    path: 'create/:type',
    component: PostEditComponent,
    data: { breadcrumb: 'Create Post' },
  },
  {
    path: ':id/edit',
    component: PostEditComponent,
    data: { breadcrumb: 'Edit Post' },
  },
  {
    path: ':id',
    canActivate: [RedirectGuard],
    component: PostEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostRoutingModule {}
