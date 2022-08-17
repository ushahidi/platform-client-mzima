import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SessionService } from '@services';
import { LoginComponent, RegisterComponent } from '@auth';
import { MenuInterface, UserMenuInterface } from '@models';
import { CollectionsComponent } from '@data';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  isLoggedIn = false;
  public menu: MenuInterface[] = [];
  public userMenu: UserMenuInterface[] = [];

  constructor(public dialog: MatDialog, private session: SessionService) {}

  ngOnInit() {
    this.session.currentUserData$.subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
    });
    this.initMenu();
  }

  private initMenu() {
    this.menu = [
      { label: 'Maps', router: 'map', icon: 'location_on', visible: true },
      { label: 'Data', router: 'data', icon: 'storage', visible: true },
      { label: 'Activity', router: 'activity', icon: 'monitoring', visible: true },
      { label: 'Settings', router: 'settings', icon: 'settings', visible: this.isLoggedIn },
    ];
    this.userMenu = [
      { label: '', icon: 'apps', visible: true, action: () => this.openCollections() },
      { label: 'Log in', icon: 'login', visible: !this.isLoggedIn, action: () => this.openLogin() },
      { label: 'Log out', icon: 'logout', visible: this.isLoggedIn, action: () => this.logout() },
      {
        label: 'Sign up',
        icon: 'person_add',
        visible: !this.isLoggedIn,
        action: () => this.openRegister(),
      },
    ];
  }

  private openLogin(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '480px',
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

  private logout() {
    this.session.clearSessionData();
    this.session.clearUserData();
    this.initMenu(); // Somehow refresh menu
  }
}
