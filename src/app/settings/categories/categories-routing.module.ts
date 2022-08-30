import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CategoriesComponent } from './categories.component';

const routes: Routes = [
  {
    path: '',
    component: CategoriesComponent,
  },
  {
    path: 'create',
    loadChildren: () => import('./create/create.module').then((m) => m.CreateModule),
  },
  {
    path: ':id',
    loadChildren: () =>
      import('./category-item/category-item.module').then((m) => m.CategoryItemModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoriesRoutingModule {}
