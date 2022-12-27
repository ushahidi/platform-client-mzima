import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { UserInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService, BreadcrumbService, SessionService } from '@services';
import { filter } from 'rxjs';
import { DonationModalComponent } from 'src/app/settings';
import { AccountSettingsComponent } from '../account-settings/account-settings.component';

@UntilDestroy()
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  @Input() languages: any;
  @Input() selectedLanguage: any;
  // TODO: Fix takeUntilDestroy$() with material components
  // private userData$ = this.session.currentUserData$.pipe(takeUntilDestroy$());
  private userData$ = this.session.currentUserData$.pipe(untilDestroyed(this));
  public isLoggedIn = false;
  public isDonateAvailable = false;
  public profile: UserInterface;
  public showSearchForm: boolean;
  public pageTitle: string;

  constructor(
    private session: SessionService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private readonly breadcrumbService: BreadcrumbService,
  ) {
    this.isDonateAvailable = this.session.getSiteConfigurations().donation?.enabled!;

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const url = router.routerState.snapshot.url;
      this.showSearchForm = url.indexOf('/map') > -1 || url.indexOf('/feed') > -1;
    });

    this.breadcrumbService.breadcrumbs$.subscribe({
      next: (res) => {
        this.pageTitle = res[0]?.instance;
      },
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
