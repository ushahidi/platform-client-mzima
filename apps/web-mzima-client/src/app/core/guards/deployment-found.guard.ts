import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SessionService } from '@services';
import { filter, Observable, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeploymentFoundGuard implements CanActivate {
  constructor(private router: Router, private service: SessionService) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.service.configLoaded$.pipe(
      filter((configLoaded) => configLoaded !== false),
      take(1),
      switchMap((configLoaded) => {
        const siteFound: boolean = this.service.siteFound;
        if (configLoaded && siteFound) {
          return [true];
        }
        return [this.router.parseUrl('/notfound')];
      }),
    );
  }
}
