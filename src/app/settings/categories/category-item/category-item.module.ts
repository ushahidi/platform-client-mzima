import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryItemComponent } from './category-item.component';
import { CategoryItemRoutingModule } from './category-item-routing.module';
import { SharedModule } from 'src/app/shared';

@NgModule({
  declarations: [CategoryItemComponent],
  imports: [CommonModule, CategoryItemRoutingModule, SharedModule],
})
export class CategoryItemModule {}
