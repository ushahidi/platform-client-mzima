import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateAgoPipe } from '@pipes';

@NgModule({
  declarations: [DateAgoPipe],
  imports: [CommonModule],
  exports: [DateAgoPipe],
})
export class PipeModule {}
