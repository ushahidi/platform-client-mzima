import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostEditPage } from './post-edit.page';

const routes: Routes = [
  {
    path: '',
    component: PostEditPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class PostEditRoutingModule {}
