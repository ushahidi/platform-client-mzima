import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateComponent } from './create.component';
import { CreateRoutingModule } from './create-routing.module';
import { SharedModule } from 'src/app/shared';

@NgModule({
  declarations: [CreateComponent],
  imports: [CommonModule, CreateRoutingModule, SharedModule],
})
export class CreateModule {}
