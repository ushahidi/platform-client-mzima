import { Component, OnInit } from '@angular/core';
import { WebhookResultInterface } from '@models';
import { WebhooksService } from '@services';

@Component({
  selector: 'app-webhooks',
  templateUrl: './webhooks.component.html',
  styleUrls: ['./webhooks.component.scss'],
})
export class WebhooksComponent implements OnInit {
  webhookList: WebhookResultInterface[] = [];

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
