import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SessionService } from '@services';
import { NavToolbarService } from '../../../helpers/navtoolbar.service';
import { Observable } from 'rxjs';
import { ShareModalComponent } from '../../share-modal/share-modal.component';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private session: SessionService,
    private navToolbarService: NavToolbarService,
  ) {
    this.isDesktop$ = this.navToolbarService.getScreenSizeAsync(this);
    this.isDonateAvailable = <boolean>this.session.getSiteConfigurations().donation?.enabled;
    this.navToolbarService.getPageTitle(this).subscribe({
      next: (res) => (this.pageTitle = res[res.length - 1]?.instance),
    });
  }

  public openShare() {
    this.dialog.open(ShareModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
      data: {
        title: this.translate.instant(this.pageTitle),
        description: this.translate.instant(this.pageTitle),
      },
    });
  }
}
