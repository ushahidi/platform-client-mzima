import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserMenuInterface } from '@models';
import { UserInterface } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService, SessionService } from '@services';
import { Observable } from 'rxjs';
import { AccountSettingsModalComponent } from '../account-settings-modal/account-settings-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-account-and-logout',
  templateUrl: './account-and-logout.component.html',
  styleUrls: ['./account-and-logout.component.scss'],
})
export class AccountAndLogoutComponent implements OnInit {
  @Input() isLink = false;

  private userData$: Observable<UserInterface>;
  public menu: UserMenuInterface[];
  public isLoggedIn = false;
  constructor(
    private session: SessionService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {
    this.userData$ = this.session.currentUserData$.pipe(untilDestroyed(this));
  }

  ngOnInit(): void {
    this.userData$.subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
      this.initMenu();
    });
  }

  private initMenu() {
    this.menu = [
      {
        label: 'nav.my_account',
        icon: 'account',
        visible: this.isLoggedIn,
        action: () => this.openSettings(),
        separator: true,
      },
      {
        label: 'nav.logout',
        icon: 'logout',
        visible: this.isLoggedIn,
        action: () => this.logout(),
      },
    ];
  }

  public openSettings(): void {
    this.dialog.open(AccountSettingsModalComponent, {
      width: '100%',
      maxWidth: 800,
      panelClass: ['modal', 'account-settings-modal'],
    });
  }

  public logout(): void {
    this.authService.logout();
  }
}
