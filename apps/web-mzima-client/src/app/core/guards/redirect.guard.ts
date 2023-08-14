import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RedirectGuard implements CanActivate {
  constructor(private router: Router) {}

  // Guard created for handling old urls
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const id = route.paramMap.get('id');
    console.log('route.paramMa111', id);
    this.router.navigate([`/feed/${id}/view`], { queryParams: { mode: 'POST', page: 1 } });
    return false;
  }
}
