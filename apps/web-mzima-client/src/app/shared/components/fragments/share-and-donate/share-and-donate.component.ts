import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SessionService } from '@services';
import { NavToolbarService } from '../../../services/shared.navtoolbar.service';
import { Observable } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-share-and-donate',
  templateUrl: './share-and-donate.component.html',
  styleUrls: ['./share-and-donate.component.scss'],
})
export class ShareAndDonateComponent {
  public isDesktop$: Observable<boolean>;
  public isDonateAvailable = false;
  public pageTitle: string;

  constructor(private session: SessionService, private navToolbarService: NavToolbarService) {
    this.isDesktop$ = this.navToolbarService.getScreenSize2(this);
    this.isDonateAvailable = <boolean>this.session.getSiteConfigurations().donation?.enabled;
    this.navToolbarService.getPageTitle(this).subscribe({
      next: (res) => (this.pageTitle = res[res.length - 1]?.instance),
    });
  }

  openShare() {
    this.navToolbarService.openShare(this.pageTitle);
  }
}
