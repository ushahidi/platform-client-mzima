import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import { SharedModule } from 'src/app/shared';

@NgModule({
  declarations: [GeneralComponent],
  imports: [CommonModule, SharedModule, GeneralRoutingModule],
})
export class GeneralModule {}
