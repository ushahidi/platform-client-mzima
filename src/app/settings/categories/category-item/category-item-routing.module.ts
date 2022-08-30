import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryItemComponent } from './category-item.component';

const routes: Routes = [{ path: '', component: CategoryItemComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryItemRoutingModule {}
