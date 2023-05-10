import { Component } from '@angular/core';
import { AuthService, SessionService } from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})
export class MapPage {
  public isLoggedIn: boolean;

  constructor(private authService: AuthService, private sessionService: SessionService) {
    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        this.isLoggedIn = !!userData.userId;
      });
  }

  public logout(): void {
    this.authService.logout();
  }
}
