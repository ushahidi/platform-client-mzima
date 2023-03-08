import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule } from '../../shared/directive.module';
import { RoleItemComponent } from './role-item/role-item.component';

import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './roles.component';

@NgModule({
  declarations: [RolesComponent, RoleItemComponent],
  imports: [
    CommonModule,
    RolesRoutingModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    DirectiveModule,
    MatIconModule,
    MatRippleModule,
    ReactiveFormsModule,
    MatInputModule,
    MatListModule,
  ],
})
export class RolesModule {}
