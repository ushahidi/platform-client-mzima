import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataQaDirective, GtmDirective } from '@directives';

@NgModule({
  declarations: [GtmDirective, DataQaDirective],
  imports: [CommonModule],
  exports: [GtmDirective, DataQaDirective],
})
export class DirectiveModule {}
