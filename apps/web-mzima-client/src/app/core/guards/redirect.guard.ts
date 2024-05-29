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
    this.router.navigate([`/feed/${id}/${route.data['edit'] ? 'edit' : 'view'}`], {
      queryParams: { mode: 'ID', page: 1 },
    });
    return false;
  }
}
