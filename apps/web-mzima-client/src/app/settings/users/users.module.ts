import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { SettingsHeaderModule } from '../../shared/components/settings-header/settings-header.module';
import { DirectiveModule, SpinnerModule } from '@shared';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { UserItemComponent } from './user-item/user-item.component';

@NgModule({
  declarations: [UsersComponent, UserItemComponent],
  imports: [
    CommonModule,
    UsersRoutingModule,
    FormsModule,
    MatSortModule,
    NgxPaginationModule,
    ProgressBarModule,
    TableModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    SliderModule,
    ButtonModule,
    SettingsHeaderModule,
    SpinnerModule,
    TranslateModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    DirectiveModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class UsersModule {}
