import { Component, OnInit } from '@angular/core';
import { WebhookResult } from '@models';
import { WebhooksService } from '@services';

@Component({
  selector: 'app-webhooks',
  templateUrl: './webhooks.component.html',
  styleUrls: ['./webhooks.component.scss'],
})
export class WebhooksComponent implements OnInit {
  webhookList: WebhookResult[] = [];

  constructor(
    private webhooksService: WebhooksService, //
  ) {}

  ngOnInit() {
    this.getWebhookList();
  }

  getWebhookList() {
    this.webhooksService.get().subscribe({
      next: (response) => {
        this.webhookList = response.results;
      },
    });
  }
}
