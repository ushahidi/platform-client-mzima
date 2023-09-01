import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiVersionToastMessageComponent } from './api-version-toast-message.component';
import { MzimaUiModule } from '@mzima-client/mzima-ui';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ApiVersionDetailsModalComponent } from './api-version-details-modal/api-version-details-modal.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [ApiVersionToastMessageComponent, ApiVersionDetailsModalComponent],
  imports: [CommonModule, MzimaUiModule, MatIconModule, MatDialogModule, TranslateModule],
  exports: [ApiVersionToastMessageComponent, ApiVersionDetailsModalComponent],
})
export class ApiVersionToastMessageModule {}
