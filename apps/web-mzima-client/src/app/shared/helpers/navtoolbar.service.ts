import { Injectable } from '@angular/core';
import { takeUntilDestroy$ } from '@helpers';
import { AuthService, BreadcrumbService, BreakpointService, SessionService } from '@services';
import { Observable } from 'rxjs';
import { AccountSettingsModalComponent } from '../components';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserInterface } from '@mzima-client/sdk';
import { Breadcrumb } from '../../core/interfaces/breadcrumb.interface';

// Reminder note: All code, methods, modals etc. in here are needed/used by more than one components after restructuring sidebar and (parts of) toolbar

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
  public isLoggedIn: boolean;
  public canRegister = false;

  constructor(
    private breakpointService: BreakpointService,
    private authService: AuthService,
    private session: SessionService,
    private breadcrumbService: BreadcrumbService,
    private dialog: MatDialog,
  ) {}

  // Set 1: Method(s) that unify access to Observables for components that need them

  public getScreenSize(): Observable<any> {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(takeUntilDestroy$());
    return this.isDesktop$;
  }

  public getScreenSizeAsync(thisClass: any): Observable<any> {
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

  // Set 2: Method(s) that are not observables, but unify/gives access to changing values to components that need them

  public toggleBurgerMenu(value?: boolean): void {
    this.isBurgerMenuOpen = value ?? !this.isBurgerMenuOpen;
  }

  public logout(): void {
    this.authService.logout();
  }

  // Set 3: Shared modal(s)

  public openAccountSettings(): void {
    this.dialog.open(AccountSettingsModalComponent, {
      width: '100%',
      maxWidth: 800,
      panelClass: ['modal', 'account-settings-modal'],
    });
  }
}
