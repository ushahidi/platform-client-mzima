import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './categories.component';
import { SharedModule } from 'src/app/shared';
import { CreateComponent } from './create/create.component';
import { CreateCategoryFormComponent } from 'src/app/settings/categories/create-category-form/create-category-form.component';
import { CategoryItemComponent } from './category-item/category-item.component';
import { CategoryComponent } from './category/category.component';

@NgModule({
  declarations: [
    CategoriesComponent,
    CreateComponent,
    CategoryItemComponent,
    CreateCategoryFormComponent,
    CategoryComponent,
  ],
  imports: [CommonModule, CategoriesRoutingModule, SharedModule],
})
export class CategoriesModule {}
