import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebhookItemComponent } from './webhook-item/webhook-item.component';
import { WebhooksComponent } from './webhooks.component';

const routes: Routes = [
  {
    path: '',
    component: WebhooksComponent,
    children: [{ path: ':id', component: WebhookItemComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebhooksRoutingModule {}
