import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoToastMessageComponent } from './info-toast-message.component';
import { MzimaUiModule } from '@mzima-client/mzima-ui';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { InfoToastDetailsModalComponent } from './info-toast-details-modal/info-toast-details-modal.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [InfoToastMessageComponent, InfoToastDetailsModalComponent],
  imports: [CommonModule, MzimaUiModule, MatIconModule, MatDialogModule, TranslateModule],
  exports: [InfoToastMessageComponent, InfoToastDetailsModalComponent],
})
export class InfoToastMessageModule {}
