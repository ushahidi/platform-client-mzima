import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CategoriesComponent } from './categories.component';
import { CategoryComponent } from './category/category.component';
import { CreateComponent } from './create/create.component';

const routes: Routes = [
  {
    path: '',
    component: CategoriesComponent,
  },
  {
    path: 'create',
    component: CreateComponent,
    data: { breadcrumb: 'Create category' },
  },
  {
    path: ':id',
    component: CategoryComponent,
    data: { breadcrumb: 'Update category' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoriesRoutingModule {}
