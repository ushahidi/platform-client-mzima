import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar.component';
import { InfoToastMessageModule } from '../info-toast-message/info-toast-message.module';
import { DirectiveModule } from '../../directive.module';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [ToolbarComponent],
  imports: [CommonModule, SharedModule, DirectiveModule, InfoToastMessageModule],
  exports: [ToolbarComponent],
})
export class ToolbarModule {}
