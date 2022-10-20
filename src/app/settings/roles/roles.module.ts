import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared';
import { RoleItemComponent } from './role-item/role-item.component';

import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './roles.component';

@NgModule({
  declarations: [RolesComponent, RoleItemComponent],
  imports: [CommonModule, SharedModule, RolesRoutingModule, RouterModule],
})
export class RolesModule {}
