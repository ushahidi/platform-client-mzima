import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class AccessAllowGuard implements CanActivate {
  constructor(private router: Router, private service: SessionService) {}

  canActivate(): boolean {
    const access: boolean = this.service.accessToSite;

    if (access) {
      this.router.navigate([`/map`]);
    } else {
      return true;
    }
    return false;
  }
}
