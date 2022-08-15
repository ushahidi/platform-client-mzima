import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LoginComponent } from '../../../auth/login/login.component';
import { RegisterComponent } from '../../../auth/register/register.component';
import { CollectionsComponent } from '../../../data/collections/collections.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  public isLogin = true;
  public menu = [
    { label: 'Maps', router: 'map', icon: 'location_on', visible: true },
    { label: 'Data', router: 'data', icon: 'storage', visible: true },
    { label: 'Activity', router: 'activity', icon: 'monitoring', visible: true },
    { label: 'Settings', router: 'settings', icon: 'settings', visible: this.isLogin },
  ];
  public userMenu = [
    { label: '', icon: 'apps', visible: true, action: () => this.openCollections() },
    { label: 'Log in', icon: 'login', visible: !this.isLogin, action: () => this.openLogin() },
    { label: 'Log out', icon: 'logout', visible: this.isLogin, action: () => this.logout() },
    {
      label: 'Sign up',
      icon: 'person_add',
      visible: !this.isLogin,
      action: () => this.openRegister(),
    },
  ];

  constructor(public dialog: MatDialog) {}

  private openLogin(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        response ? console.log(response) : null;
      },
    });
  }

  private openRegister(): void {
    const dialogRef = this.dialog.open(RegisterComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        response ? console.log(response) : null;
      },
    });
  }

  private openCollections(): void {
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        response ? console.log(response) : null;
      },
    });
  }

  private logout() {}
}
