import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class DeploymentFoundGuard implements CanActivate {
  constructor(private router: Router, private service: SessionService) {}

  canActivate(): boolean {
    const siteFound: boolean = this.service.siteFound;

    if (siteFound) {
      return true;
    } else {
      this.router.navigate([`/notfound`]);
    }
    return false;
  }
}
