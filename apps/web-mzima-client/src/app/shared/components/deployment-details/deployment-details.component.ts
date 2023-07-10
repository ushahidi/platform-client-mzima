import { Component } from '@angular/core';
import { takeUntilDestroy$ } from '@helpers';
import { BreakpointService } from '@services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-deployment-details',
  templateUrl: './deployment-details.component.html',
  styleUrls: ['./deployment-details.component.scss'],
})
export class DeploymentDetailsComponent {
  private isDesktop$: Observable<boolean>;
  public isDesktop = false;

  constructor(private breakpointService: BreakpointService) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(takeUntilDestroy$());
    this.isDesktop$.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }
}
