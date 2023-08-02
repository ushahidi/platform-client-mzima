import { Component } from '@angular/core';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SessionService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-base',
  template: '',
})
export abstract class BaseComponent {
  public user: UserInterface;
  public isLoggedIn: boolean;

  constructor(protected sessionService: SessionService) {}

  abstract loadData(): void;

  getUserData(): void {
    this.sessionService.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: (userData) => {
        this.user = userData;
        this.isLoggedIn = !!userData.userId;
        this.loadData();
      },
    });
  }
}
