import { TextFieldModule } from '@angular/cdk/text-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { GroupCheckboxSelectModule } from '../../shared/components/group-checkbox-select/group-checkbox-select.module';
import { SettingsHeaderModule } from '../../shared/components/settings-header/settings-header.module';
import { SpinnerModule } from '../../shared/components/spinner/spinner.module';
import { DirectiveModule } from '../../shared/directive.module';
import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './categories.component';
import { CreateComponent } from './create/create.component';
import { CreateCategoryFormComponent } from 'src/app/settings/categories/create-category-form/create-category-form.component';
import { CategoryItemComponent } from './category-item/category-item.component';
import { CategoryComponent } from './category/category.component';

@NgModule({
  declarations: [
    CategoriesComponent,
    CreateComponent,
    CategoryItemComponent,
    CreateCategoryFormComponent,
    CategoryComponent,
  ],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    SpinnerModule,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextFieldModule,
    MatInputModule,
    MatSelectModule,
    GroupCheckboxSelectModule,
    MatIconModule,
    MatButtonModule,
    DirectiveModule,
    SettingsHeaderModule,
  ],
})
export class CategoriesModule {}
