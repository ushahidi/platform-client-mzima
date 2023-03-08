import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataQaDirective, DataQaInputDirective, GtmDirective } from '@directives';

@NgModule({
  declarations: [GtmDirective, DataQaInputDirective, DataQaDirective],
  imports: [CommonModule],
  exports: [GtmDirective, DataQaInputDirective, DataQaDirective],
})
export class DirectiveModule {}
