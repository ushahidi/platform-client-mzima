import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BreakpointService, EventBusService, EventType } from '@services';
import { filter } from 'rxjs';

@Component({
  selector: 'app-settings-layout',
  templateUrl: './settings-layout.component.html',
  styleUrls: ['./settings-layout.component.scss'],
})
export class SettingsLayoutComponent {
  public isDesktop = false;
  public isInnerPage = false;

  constructor(
    private breakpointService: BreakpointService,
    private router: Router,
    private eventBusService: EventBusService,
  ) {
    this.breakpointService.isDesktop.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;

        this.checkIsInnerPage();

        if (this.isDesktop && !this.isInnerPage) {
          this.router.navigate(['settings/general']);
        }
      },
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe({
      next: () => {
        this.checkIsInnerPage();
      },
    });
  }

  private checkIsInnerPage(): void {
    this.isInnerPage = this.router.url.split('/').length > 2;
    this.eventBusService.next({
      type: EventType.IsSettingsInnerPage,
      payload: {
        inner: this.isInnerPage,
      },
    });
  }
}
