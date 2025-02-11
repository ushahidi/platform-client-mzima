import { Injectable } from '@angular/core';
import { CanDeactivate /*, ActivatedRouteSnapshot, RouterStateSnapshot*/ } from '@angular/router';
import { Observable } from 'rxjs';

export interface IDeactivateGuard {
  canExit: () => boolean | Promise<boolean> | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class DeactivateGuardService implements CanDeactivate<IDeactivateGuard> {
  canDeactivate(
    component: IDeactivateGuard,
    // route: ActivatedRouteSnapshot,
    // currentState: RouterStateSnapshot,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return component.canExit();
  }
}
