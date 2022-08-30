import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateComponent } from './create.component';
import { CreateRoutingModule } from './create-routing.module';
import { SharedModule } from 'src/app/shared';
import { CreateCategoryFormComponent } from 'src/app/shared/components/create-category-form/create-category-form.component';

@NgModule({
  declarations: [CreateComponent, CreateCategoryFormComponent],
  imports: [CommonModule, CreateRoutingModule, SharedModule],
})
export class CreateModule {}
