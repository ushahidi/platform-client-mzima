import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './categories.component';
import { SharedModule } from 'src/app/shared';
import { CategoryItemComponent } from 'src/app/shared/components/category-item/category-item.component';

@NgModule({
  declarations: [CategoriesComponent, CategoryItemComponent],
  imports: [CommonModule, CategoriesRoutingModule, SharedModule],
})
export class CategoriesModule {}
