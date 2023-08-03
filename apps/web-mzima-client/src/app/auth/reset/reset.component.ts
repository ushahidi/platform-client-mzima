import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointService, EventBusService, EventType, SessionService } from '@services';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
})
export class ResetComponent extends BaseComponent {
  public isPasswordRestored: boolean;

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private eventBusService: EventBusService,
    private router: Router,
  ) {
    super(sessionService, breakpointService);
  }

  loadData() {}

  public passwordRestored(): void {
    this.isPasswordRestored = true;
  }

  public openLoginModal(): void {
    if (this.checkAllowedAccessToSite()) {
      this.eventBusService.next({
        type: EventType.OpenLoginModal,
        payload: {},
      });
    }

    this.router.navigate(['map']);
  }
}
