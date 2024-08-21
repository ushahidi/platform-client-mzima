import { NgModule } from '@angular/core';
import { PrependUrlPipe } from './prepend-url.pipe';

@NgModule({
  declarations: [PrependUrlPipe],
  exports: [PrependUrlPipe],
})
export class PrependUrlModule {}
