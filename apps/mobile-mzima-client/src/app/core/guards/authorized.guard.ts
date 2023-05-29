import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { SessionService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class AuthorizedGuard implements CanActivate {
  public isDesktop: boolean;

  constructor(private router: Router, private sessionService: SessionService) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const isLogged = this.sessionService.isLogged();
    if (!isLogged) {
      console.warn('Not authorized');
      // this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }
}
