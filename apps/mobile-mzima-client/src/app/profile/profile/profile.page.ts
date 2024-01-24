import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { STORAGE_KEYS, profileMenu } from '@constants';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  AlertService,
  AuthService,
  DatabaseService,
  IntercomService,
  SessionService,
} from '@services';

interface SupportItem {
  title: string;
  description: string;
  action: () => NonNullable<unknown>;
}

@UntilDestroy()
@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage {
  public profileMenu: profileMenu.ProfileMenuItem[] = profileMenu.profileMenu;
  public profileInformationMenu = profileMenu.profileInformationMenu;
  public isSupportModalOpen = false;
  public isSupportModalSearchView = false;
  public supportSearchQuery = '';
  public supportItems: SupportItem[] = [];
  public filteredSupportItems: SupportItem[] = this.supportItems;

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataBaseService: DatabaseService,
    private intercomService: IntercomService,
  ) {
    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        this.profileMenu = profileMenu.profileMenu.filter(
          (i) => i.isLoggedGuard === undefined || i.isLoggedGuard === !!userData.userId,
        );
        if (userData.userId)
          this.supportItems.push(<SupportItem>{
            title: 'Intercom',
            description: 'Contact Ushahidi staff for chat support',
            action: () => {
              this.intercomService.displayMessenger();
            },
          });
      });
  }

  public goTo(route: any[]): void {
    this.router.navigate(route);
  }

  public callAction(action: profileMenu.ProfileMenuActions): void {
    const actions: Record<profileMenu.ProfileMenuActions, () => void> = {
      [profileMenu.ProfileMenuActions.LOGOUT]: () => this.logout(),
      [profileMenu.ProfileMenuActions.SUPPORT]: () => this.showSupportModal(),
      // [profileMenu.ProfileMenuActions.RESET_DATA]: () => this.resetAppData(),
      // [profileMenu.ProfileMenuActions.CLEAR_PENDING_POSTS]: () => this.clearPosts(),
    };
    actions[action]();
  }

  private async logout(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: 'Logout',
      message:
        'Are you sure you want to log out of the application? This action will end your current session and you will be required to log in again to access your account.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Logout',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      this.authService.logout();
    }
  }

  private async showSupportModal(): Promise<void> {
    this.isSupportModalOpen = true;
  }

  private async clearPosts(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: 'Delete Pending Posts?',
      message:
        'Are you sure you want to delete the pending posts? This action cannot be undone and will permanently remove all pending posts from the system.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      await this.dataBaseService.set(STORAGE_KEYS.PENDING_POST_KEY, []);
      this.router.navigate(['/']);
    }
  }

  private async resetAppData(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: 'Clear App Data?',
      message:
        'Are you sure you want to clear the app data? This action will delete all cached information. Please note that it will also log you out, and any locally stored data, including settings and preferences, will be cleared from your device. This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Clear',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      localStorage.clear();
      this.authService.logout();
      this.dataBaseService.clear();
      this.router.navigate(['/walkthrough']);
    }
  }

  public showSearchResults(): void {
    this.isSupportModalSearchView = true;
  }

  public hideSearchResults(): void {
    this.isSupportModalSearchView = false;
  }

  public resetSearchForm(): void {
    this.supportSearchQuery = '';
  }
}
