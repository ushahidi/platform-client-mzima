import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SessionService } from '@services';
import { NavToolbarService } from '../../../services/shared.navtoolbar.service';

@UntilDestroy()
@Component({
  selector: 'app-deployment-broadcast',
  templateUrl: './deployment-broadcast.component.html',
  styleUrls: ['./deployment-broadcast.component.scss'],
})
export class DeploymentBroadcastComponent {
  public isDonateAvailable = false;
  public pageTitle: string;

  constructor(private session: SessionService, private navToolbarService: NavToolbarService) {
    this.isDonateAvailable = <boolean>this.session.getSiteConfigurations().donation?.enabled;
    this.navToolbarService.getPageTitle(this).subscribe({
      next: (res) => (this.pageTitle = res[res.length - 1]?.instance),
    });
  }

  openShare() {
    this.navToolbarService.openShare(this.pageTitle);
  }
}
