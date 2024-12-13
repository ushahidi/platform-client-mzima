import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserItemComponent } from './user-item/user-item.component';

import { UsersComponent } from './users.component';

const routes: Routes = [
  { path: '', component: UsersComponent },
  {
    path: 'update/:id',
    component: UserItemComponent,
    data: { breadcrumb: 'user.update_user' },
  },
  { path: 'create', component: UserItemComponent, data: { breadcrumb: 'user.create_user' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
