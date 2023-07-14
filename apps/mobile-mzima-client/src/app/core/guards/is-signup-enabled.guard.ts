import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { SessionService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class IsSignupEnabledGuard implements CanActivate {
  public isDesktop: boolean;

  constructor(private router: Router, private sessionService: SessionService) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const siteConfig = this.sessionService.getSiteConfigurations();
    if (!siteConfig.private && !siteConfig.disable_registration) {
      return true;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
