import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared';
import { RoleItemRoutingModule } from './role-item-routing.module';
import { RoleItemComponent } from './role-item.component';

@NgModule({
  declarations: [RoleItemComponent],
  imports: [CommonModule, RoleItemRoutingModule, SharedModule],
})
export class RoleItemModule {}
