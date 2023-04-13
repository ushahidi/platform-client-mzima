import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NxWelcomeComponent } from './nx-welcome.component';

@NgModule({
  imports: [CommonModule],
  declarations: [NxWelcomeComponent],
  exports: [NxWelcomeComponent],
})
export class NxWelcomeComponentModule {}
