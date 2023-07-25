import { NgModule } from '@angular/core';
import { SortByFieldPipe } from './sort-by.pipe';

@NgModule({
  declarations: [SortByFieldPipe],
  exports: [SortByFieldPipe],
})
export class SortByFieldModule {}
