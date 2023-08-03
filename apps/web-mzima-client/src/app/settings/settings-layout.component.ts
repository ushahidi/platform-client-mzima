import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Roles } from '@enums';
import { BreakpointService, EventBusService, EventType } from '@services';
import { filter } from 'rxjs';
import { BaseComponent } from '../base.component';
import { SessionService } from '../core/services/session.service';

@Component({
  selector: 'app-settings-layout',
  templateUrl: './settings-layout.component.html',
  styleUrls: ['./settings-layout.component.scss'],
})
export class SettingsLayoutComponent extends BaseComponent {
  public isInnerPage = false;

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private router: Router,
    private eventBusService: EventBusService,
  ) {
    super(sessionService, breakpointService);
    this.getUserData();
    this.checkDesktop();

    this.checkIsInnerPage();

    if (this.isDesktop && !this.isInnerPage) {
      this.navigateToInnerPage();
    }

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe({
      next: () => {
        this.checkIsInnerPage();
      },
    });
  }

  loadData(): void {}

  private navigateToInnerPage(): void {
    switch (this.user.role) {
      case Roles.Admin:
      case Roles.ManageSettings:
        this.router.navigate(['settings/general']);
        break;
      case Roles.ManageUsers:
        this.router.navigate(['settings/user-settings']);
        break;
      case Roles.ManageImportExport:
        this.router.navigate(['settings/data-import']);
        break;
    }
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
