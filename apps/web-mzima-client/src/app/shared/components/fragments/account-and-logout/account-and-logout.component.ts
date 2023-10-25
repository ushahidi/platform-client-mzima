import { Component, OnInit } from '@angular/core';

import { AuthService, BreakpointService, ConfigService, SessionService } from '@services';
import { NavToolbarService } from '../../../helpers/navtoolbar.service';
import { BaseComponent } from '../../../../base.component';

@Component({
  selector: 'app-account-and-logout',
  templateUrl: './account-and-logout.component.html',
  styleUrls: ['./account-and-logout.component.scss'],
})
export class AccountAndLogoutComponent extends BaseComponent implements OnInit {
  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private configService: ConfigService,
    private authService: AuthService,
    private navToolbarService: NavToolbarService,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();
  }

  ngOnInit(): void {
    this.getUserData();
  }

  loadData(): void {}

  public openAccountSettings(): void {
    this.navToolbarService.openAccountSettings();
  }

  public logout(): void {
    this.authService.logout();
    this.configService.initAllConfigurations();
  }
}
