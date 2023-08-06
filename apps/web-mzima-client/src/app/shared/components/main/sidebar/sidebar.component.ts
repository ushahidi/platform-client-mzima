import { Component } from '@angular/core';
import { takeUntilDestroy$ } from '@helpers';
import { BreakpointService, EventBusService, EventType } from '@services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  private isDesktop$: Observable<boolean>;
  public isDesktop = false;
  public isInnerPage = false;

  constructor(
    private eventBusService: EventBusService,
    private breakpointService: BreakpointService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(takeUntilDestroy$());
    this.isDesktop$.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });

    this.eventBusService.on(EventType.IsSettingsInnerPage).subscribe({
      next: (option) => {
        this.isInnerPage = Boolean(option.inner);
      },
    });
  }
}
