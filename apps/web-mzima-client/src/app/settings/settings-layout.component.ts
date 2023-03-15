import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Roles } from '@enums';
import { takeUntilDestroy$ } from '@helpers';
import { UserInterface } from '@models';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BreakpointService, EventBusService, EventType } from '@services';
import { filter } from 'rxjs';
import { SessionService } from '../core/services/session.service';

@UntilDestroy()
@Component({
  selector: 'app-settings-layout',
  templateUrl: './settings-layout.component.html',
  styleUrls: ['./settings-layout.component.scss'],
})
export class SettingsLayoutComponent {
  public isDesktop = false;
  public isInnerPage = false;
  public userData: UserInterface;

  constructor(
    private breakpointService: BreakpointService,
    private router: Router,
    private eventBusService: EventBusService,
    private sessionService: SessionService,
  ) {
    this.sessionService.currentUserData$.pipe(takeUntilDestroy$()).subscribe({
      next: (userData) => (this.userData = userData),
    });

    this.breakpointService.isDesktop$.pipe(takeUntilDestroy$()).subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;

        this.checkIsInnerPage();

        if (this.isDesktop && !this.isInnerPage) {
          this.navigateToInnerPage();
        }
      },
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe({
      next: () => {
        this.checkIsInnerPage();
      },
    });
  }

  private navigateToInnerPage(): void {
    switch (this.userData.role) {
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
