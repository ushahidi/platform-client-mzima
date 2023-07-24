import { Injectable } from '@angular/core';
import { takeUntilDestroy$ } from '@helpers';
import { AuthService, BreadcrumbService, BreakpointService, SessionService } from '@services';
import { Observable } from 'rxjs';
import {
  AccountSettingsModalComponent,
  ShareModalComponent,
  SupportModalComponent,
} from '../components';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CollectionsComponent } from '../components';
import { UserInterface } from '@mzima-client/sdk';
import { LoginComponent } from '../../auth/login/login.component';
import { TranslateService } from '@ngx-translate/core';
import { Breadcrumb } from '../../core/interfaces/breadcrumb.interface';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class NavToolbarService {
  public isBurgerMenuOpen$: Observable<boolean>;
  public isDesktop$: Observable<boolean>;
  public userData$: Observable<UserInterface>;
  public pageTitle$: Observable<Breadcrumb[]>;
  public isBurgerMenuOpen = false;

  constructor(
    private breakpointService: BreakpointService,
    private authService: AuthService,
    private session: SessionService,
    private translate: TranslateService,
    private breadcrumbService: BreadcrumbService,
    private dialog: MatDialog,
  ) {}

  public getScreenSize(): Observable<any> {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(takeUntilDestroy$());
    return this.isDesktop$;
  }

  public getScreenSize2(thisClass: any): Observable<any> {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(thisClass));
    return this.isDesktop$;
  }

  public getUserData(thisClass: any): Observable<any> {
    this.userData$ = this.session.currentUserData$.pipe(untilDestroyed(thisClass));
    return this.userData$;
  }

  public getPageTitle(thisClass: any): Observable<any> {
    this.pageTitle$ = this.breadcrumbService.breadcrumbs$.pipe(untilDestroyed(thisClass));
    return this.pageTitle$;
  }

  public toggleBurgerMenu(value?: boolean): void {
    this.isBurgerMenuOpen = value ?? !this.isBurgerMenuOpen;
  }

  public openCollections(): void {
    this.toggleBurgerMenu(false);
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '100%',
      maxWidth: '768px',
      panelClass: ['modal', 'collections-modal'],
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        response ? console.log(response) : null;
      },
    });
  }

  public openSupportModal(): void {
    this.dialog.open(SupportModalComponent, {
      width: '100%',
      maxWidth: 768,
      panelClass: ['modal', 'support-modal'],
    });
  }

  public openAccountSettings(): void {
    this.toggleBurgerMenu(false);
    this.dialog.open(AccountSettingsModalComponent, {
      width: '100%',
      maxWidth: 800,
      panelClass: ['modal', 'account-settings-modal'],
    });
  }

  public logout(): void {
    this.authService.logout();
  }

  public openLogin(canRegister: boolean): void {
    this.toggleBurgerMenu(false);
    this.dialog.open(LoginComponent, {
      width: '100%',
      maxWidth: 576,
      panelClass: ['modal', 'login-modal'],
      data: {
        isSignupActive: canRegister,
      },
    });
  }

  public openShare(pageTitle: string) {
    this.dialog.open(ShareModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
      data: {
        title: this.translate.instant(pageTitle),
        description: this.translate.instant(pageTitle),
      },
    });
  }
}
