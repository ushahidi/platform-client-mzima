import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResetTokenGuard implements CanActivate {
  constructor(private router: Router) {}

  // Guard created for handling old reset password url on legacy deployments
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    this.router.navigate([`/reset`], { queryParams: { token: route.paramMap.get('token') } });
    return false;
  }
}
