import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleItemComponent } from './role-item/role-item.component';

import { RolesComponent } from './roles.component';

const routes: Routes = [
  {
    path: '',
    component: RolesComponent,
  },
  {
    path: 'update/:id',
    component: RoleItemComponent,
    data: { breadcrumb: 'Update role' },
  },
  { path: 'create', component: RoleItemComponent, data: { breadcrumb: 'Create role' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RolesRoutingModule {}
