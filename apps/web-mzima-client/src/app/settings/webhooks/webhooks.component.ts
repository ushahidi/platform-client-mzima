import { Component, OnInit } from '@angular/core';
import { takeUntilDestroy$ } from '@helpers';
import { WebhooksService, WebhookResultInterface } from '@mzima-client/sdk';
import { Observable } from 'rxjs';
import { BreakpointService } from '@services';

@Component({
  selector: 'app-webhooks',
  templateUrl: './webhooks.component.html',
  styleUrls: ['./webhooks.component.scss'],
})
export class WebhooksComponent implements OnInit {
  public webhookList: WebhookResultInterface[] = [];
  public webhookState$: Observable<any>;
  public isDesktop$: Observable<boolean>;

  constructor(
    private webhooksService: WebhooksService,
    private breakpointService: BreakpointService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(takeUntilDestroy$());
    this.webhookState$ = this.webhooksService.changeWebhookState$.pipe(takeUntilDestroy$());
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
      error: (err: any) => console.log(err),
    });
  }
}
