import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SessionService, AuthService, GtmTrackingService } from '@services';
import { LoginComponent } from '@auth';
import { MenuInterface, UserMenuInterface } from '@models';
import { CollectionsComponent } from '@data';
import { takeUntilDestroy$ } from '@helpers';
import { EnumGtmEvent, EnumGtmSource } from '@enums';
import { AccountSettingsComponent } from '../account-settings/account-settings.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  public menu: MenuInterface[] = [];
  public userMenu: UserMenuInterface[] = [];
  userData$ = this.sessionService.currentUserData$.pipe(takeUntilDestroy$());

  constructor(
    private dialog: MatDialog,
    private sessionService: SessionService,
    private authService: AuthService,
    private gtmTracking: GtmTrackingService,
  ) {}

  ngOnInit() {
    this.userData$.subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
      this.isAdmin = userData.role === 'admin';
    });
    this.initMenu();
  }

  private initMenu() {
    this.menu = [
      { label: 'Maps', router: 'map', icon: 'location_on', visible: true },
      { label: 'Feed', router: 'feed', icon: 'storage', visible: true },
      { label: 'Data', router: 'data', icon: 'table', visible: true },
      { label: 'Activity', router: 'activity', icon: 'monitoring', visible: true },
      { label: 'Settings', router: 'settings', icon: 'settings', visible: this.isAdmin },
    ];
    this.userMenu = [
      { label: 'Collections', icon: 'apps', visible: true, action: () => this.openCollections() },
      {
        label: 'Profile',
        icon: 'face',
        visible: this.isLoggedIn,
        action: () => this.openProfile(),
      },
      { label: 'Log in', icon: 'login', visible: !this.isLoggedIn, action: () => this.openLogin() },
      { label: 'Log out', icon: 'logout', visible: this.isLoggedIn, action: () => this.logout() },
    ];
  }

  private openLogin(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '100%',
      maxWidth: 480,
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        if (response) {
          console.log('After login User info: ', response);
          this.initMenu();
        }
      },
    });
  }

  private openCollections(): void {
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '480px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        response ? console.log(response) : null;
      },
    });
  }

  private logout() {
    this.authService.logout();
    this.initMenu(); // Somehow refresh menu
  }

  registerPage(event: MouseEvent, router: string, label: string) {
    event.preventDefault();
    this.gtmTracking.registerEvent(
      {
        event: EnumGtmEvent.PageView,
        // @ts-ignore
        source: EnumGtmSource[label],
      },
      GtmTrackingService.MapPath(`/${router}`),
    );
  }

  private openProfile(): void {
    this.dialog.open(AccountSettingsComponent, {
      width: '480px',
    });
  }
}
