import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule } from '@shared';
import { WebhooksRoutingModule } from './webhooks-routing.module';
import { WebhooksComponent } from './webhooks.component';
import { WebhookItemComponent } from './webhook-item/webhook-item.component';

@NgModule({
  declarations: [WebhooksComponent, WebhookItemComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    WebhooksRoutingModule,
    MatButtonModule,
    DirectiveModule,
    MatIconModule,
    MatRippleModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
  ],
})
export class WebhooksModule {}
