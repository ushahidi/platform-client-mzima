import { Component } from '@angular/core';
import { NavToolbarService } from '../../../helpers/navtoolbar.service';
import { BaseComponent } from '../../../../base.component';
import { BreakpointService, SessionService } from '@services';

@Component({
  selector: 'app-deployment-details',
  templateUrl: './deployment-details.component.html',
  styleUrls: ['./deployment-details.component.scss'],
})
export class DeploymentDetailsComponent extends BaseComponent {
  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private navToolbarService: NavToolbarService,
  ) {
    super(sessionService, breakpointService);
  }

  loadData(): void {}

  public toggleBurgerMenu(value: boolean) {
    this.navToolbarService.toggleBurgerMenu(value); //always false for the close button
  }
}
