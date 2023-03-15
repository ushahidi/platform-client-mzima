import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateAgoPipe, FilterValuePipe } from '@pipes';

@NgModule({
  declarations: [DateAgoPipe, FilterValuePipe],
  imports: [CommonModule],
  exports: [DateAgoPipe, FilterValuePipe],
})
export class PipeModule {}
