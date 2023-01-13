import { Component, OnInit } from '@angular/core';
import { takeUntilDestroy$ } from '@helpers';
import { WebhookResultInterface } from '@models';
import { WebhooksService, BreakpointService } from '@services';

@Component({
  selector: 'app-webhooks',
  templateUrl: './webhooks.component.html',
  styleUrls: ['./webhooks.component.scss'],
})
export class WebhooksComponent implements OnInit {
  webhookList: WebhookResultInterface[] = [];
  webhookState$ = this.webhooksService.changeWebhookState$.pipe(takeUntilDestroy$());
  public isDesktop = false;

  constructor(
    private webhooksService: WebhooksService,
    private breakpointService: BreakpointService,
  ) {
    this.breakpointService.isDesktop.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

  ngOnInit() {
    this.getWebhookList();
    this.webhookState$.subscribe({
      next: (value) => {
        if (value) this.getWebhookList();
      },
      error: (err) => console.log(err),
    });
  }

  getWebhookList() {
    this.webhooksService.get().subscribe({
      next: (response) => {
        this.webhookList = response.results;
        this.webhooksService.setState(false);
      },
      error: (err) => console.log(err),
    });
  }
}
