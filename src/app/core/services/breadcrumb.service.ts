import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Data, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { BreadcrumbInterface } from '../interfaces/breadcrumb.interface';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly _breadcrumbs$ = new BehaviorSubject<BreadcrumbInterface[]>([]);

  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(private router: Router) {
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const root = router.routerState.snapshot.root;
      const breadcrumbs: BreadcrumbInterface[] = [];
      this.addBreadcrumb(root, [], breadcrumbs);

      this._breadcrumbs$.next(breadcrumbs);
    });
  }

  private addBreadcrumb(
    route: ActivatedRouteSnapshot | null,
    parentUrl: string[],
    breadcrumbs: BreadcrumbInterface[],
  ) {
    if (route) {
      const routeUrl = parentUrl.concat(route.url.map((url) => url.path));

      if (route.data['breadcrumb']) {
        const breadcrumb = {
          label: this.getLabel(route.data),
          url: '/' + routeUrl.join('/'),
        };
        breadcrumbs.push(breadcrumb);
      }

      this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
    }
  }

  private getLabel(data: Data) {
    return typeof data['breadcrumb'] === 'function' ? data['breadcrumb'](data) : data['breadcrumb'];
  }
}
