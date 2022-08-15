import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';

@NgModule({
  declarations: [GeneralComponent],
  imports: [CommonModule, GeneralRoutingModule],
})
export class GeneralModule {}
