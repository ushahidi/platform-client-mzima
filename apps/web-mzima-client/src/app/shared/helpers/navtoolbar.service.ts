import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountSettingsModalComponent } from '../components';
import { MatDialog } from '@angular/material/dialog';
import { UserInterface } from '@mzima-client/sdk';
import { Breadcrumb } from '../../core/interfaces/breadcrumb.interface';

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

  constructor(private dialog: MatDialog) {}

  // Removed other functions added here previously since we now have base.component.ts sharing needed data
  // TODO: Should these remaining 2 also go into the base component ts file?

  public toggleBurgerMenu(value?: boolean): void {
    this.isBurgerMenuOpen = value ?? !this.isBurgerMenuOpen;
  }

  public openAccountSettings(): void {
    this.dialog.open(AccountSettingsModalComponent, {
      width: '100%',
      maxWidth: 800,
      panelClass: ['modal', 'account-settings-modal'],
    });
  }
}
