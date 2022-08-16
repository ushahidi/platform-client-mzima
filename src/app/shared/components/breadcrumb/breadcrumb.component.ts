import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BreadcrumbInterface } from '@models';
import { BreadcrumbService } from '@services';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  breadcrumbs$: Observable<BreadcrumbInterface[]>;

  constructor(private readonly breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
  }
}
