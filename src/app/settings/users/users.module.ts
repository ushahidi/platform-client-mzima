import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule, SharedModule } from '@shared';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { UserItemComponent } from './user-item/user-item.component';

@NgModule({
  declarations: [UsersComponent, UserItemComponent],
  imports: [CommonModule, UsersRoutingModule, MaterialModule, FormsModule, SharedModule],
})
export class UsersModule {}
