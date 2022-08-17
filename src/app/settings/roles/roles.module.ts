import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './roles.component';

@NgModule({
  declarations: [RolesComponent],
  imports: [CommonModule, RolesRoutingModule, RouterModule],
})
export class RolesModule {}
