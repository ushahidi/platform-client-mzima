import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostRoutingModule {}
