import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostItemComponent } from './post-item/post-item.component';

const routes: Routes = [
  {
    path: 'create/:type',
    component: PostItemComponent,
    data: { breadcrumb: 'Create Post' },
  },
  {
    path: 'edit/:id',
    component: PostItemComponent,
    data: { breadcrumb: 'Edit Post' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostRoutingModule {}
