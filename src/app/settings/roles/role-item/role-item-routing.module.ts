import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleItemComponent } from './role-item.component';

const routes: Routes = [{ path: '', component: RoleItemComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoleItemRoutingModule {}
