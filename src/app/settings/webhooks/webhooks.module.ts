import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../shared';
import { WebhooksRoutingModule } from './webhooks-routing.module';
import { WebhooksComponent } from './webhooks.component';
import { WebhookItemComponent } from './webhook-item/webhook-item.component';

@NgModule({
  declarations: [WebhooksComponent, WebhookItemComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    WebhooksRoutingModule,
  ],
})
export class WebhooksModule {}
