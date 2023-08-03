import { Component } from '@angular/core';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreakpointService, SessionService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-base',
  template: '',
})
export abstract class BaseComponent {
  public user: UserInterface;
  public isLoggedIn: boolean;
  public isDesktop: boolean = false;

  constructor(
    protected sessionService: SessionService,
    protected breakpointService: BreakpointService,
  ) {}

  abstract loadData(): void;

  public getUserData(): void {
    this.sessionService.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: (userData) => {
        this.user = userData;
        this.isLoggedIn = !!userData.userId;
        this.loadData();
      },
    });
  }

  public checkDesktop() {
    this.breakpointService.isDesktop$.pipe(untilDestroyed(this)).subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }
}
