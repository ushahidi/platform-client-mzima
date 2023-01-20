import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from '@shared';
import { NgxPaginationModule } from 'ngx-pagination';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { UserItemComponent } from './user-item/user-item.component';

@NgModule({
  declarations: [UsersComponent, UserItemComponent],
  imports: [
    CommonModule,
    UsersRoutingModule,
    FormsModule,
    SharedModule,
    MatSortModule,
    NgxPaginationModule,
    ProgressBarModule,
    TableModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    SliderModule,
    ButtonModule,
  ],
})
export class UsersModule {}
