import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebhookItemComponent } from './webhook-item/webhook-item.component';
import { WebhooksComponent } from './webhooks.component';

const routes: Routes = [
  {
    path: '',
    component: WebhooksComponent,
  },
  {
    path: ':id',
    component: WebhookItemComponent,
    data: { breadcrumb: 'webhook.update_webhook' },
  },
  {
    path: 'create',
    component: WebhookItemComponent,
    data: { breadcrumb: 'webhook.create_webhook' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebhooksRoutingModule {}
