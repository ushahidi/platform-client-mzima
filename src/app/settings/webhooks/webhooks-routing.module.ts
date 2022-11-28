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
    data: { breadcrumb: 'Update webhook' },
  },
  { path: 'create', component: WebhookItemComponent, data: { breadcrumb: 'Create webhook' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebhooksRoutingModule {}
