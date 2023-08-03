import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class AccessDeniedGuard implements CanActivate {
  constructor(private router: Router, private service: SessionService) {}

  canActivate(): boolean {
    const access: boolean = this.service.accessToSite;

    if (access) {
      return true;
    } else {
      this.router.navigate([`/forbidden`]);
    }
    return false;
  }
}
