import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { UserInterface } from '@models';
import { AuthService, SessionService } from '@services';
import { filter } from 'rxjs';
import { DonationModalComponent } from 'src/app/settings';
import { AccountSettingsComponent } from '../account-settings/account-settings.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  public isLoggedIn = false;
  public isDonateAvailable = false;
  private userData$ = this.session.currentUserData$;
  public profile: UserInterface;
  public showSearchForm: boolean;

  constructor(
    private session: SessionService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
  ) {
    this.isDonateAvailable = this.session.getSiteConfigurations().donation?.enabled!;

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const url = router.routerState.snapshot.url;
      this.showSearchForm = (url.indexOf('/settings') && url.indexOf('/activity')) === -1;
    });
  }

  ngOnInit(): void {
    this.userData$.subscribe((userData) => {
      this.profile = userData;
      this.isLoggedIn = !!userData.userId;
    });
  }

  public showDonation(): void {
    this.dialog.open(DonationModalComponent, {
      width: '100%',
      maxWidth: 564,
    });
  }

  public openSettings(): void {
    this.dialog.open(AccountSettingsComponent, {
      width: '480px',
    });
  }

  public logout(): void {
    this.authService.logout();
  }
}
