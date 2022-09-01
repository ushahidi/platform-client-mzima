import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './categories.component';
import { SharedModule } from 'src/app/shared';
import { CreateComponent } from './create/create.component';
import { CategoryItemComponent } from './category-item/category-item.component';

@NgModule({
  declarations: [CategoriesComponent, CreateComponent, CategoryItemComponent],
  imports: [CommonModule, CategoriesRoutingModule, SharedModule],
})
export class CategoriesModule {}
