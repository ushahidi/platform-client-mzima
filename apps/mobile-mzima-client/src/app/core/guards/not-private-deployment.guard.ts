import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { SessionService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class NotPrivateDeploymentGuard implements CanActivate {
  private isPrivate: boolean;

  constructor(private router: Router, private sessionService: SessionService) {
    const siteConfig = this.sessionService.getSiteConfigurations();
    this.isPrivate = !!siteConfig.private;

    this.sessionService.siteConfig$.subscribe({
      next: (config) => {
        this.isPrivate = !!config.private;
      },
    });
  }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const isLogged = this.sessionService.isLogged();
    if (this.isPrivate && !isLogged) {
      this.router.navigate(['auth/login']);
      return false;
    } else {
      return true;
    }
  }
}
