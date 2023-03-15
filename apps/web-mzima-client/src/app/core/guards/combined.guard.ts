import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { concatMap, first, from, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CombinedGuard implements CanActivate {
  constructor(private injector: Injector) {}

  // @ts-ignore
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<Observable<boolean | UrlTree>> {
    const guards = route.data['guards'] || [];
    return from(guards).pipe(
      concatMap((value) => {
        const guard = this.injector.get(value);
        const result = guard.canActivate(route, state);
        if (result instanceof Observable) {
          return result;
        } else if (result instanceof Promise) {
          return from(result);
        } else {
          return of(result);
        }
      }),
      first((x) => x === false || x instanceof UrlTree, true),
    );
  }
}
