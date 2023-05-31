import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class NotAuthorizedGuard implements CanActivate {
  private isLoggedIn: boolean;

  constructor(private router: Router, private sessionService: SessionService) {
    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        this.isLoggedIn = !!userData.userId;
      });
  }

  canActivate(): boolean {
    if (this.isLoggedIn) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
