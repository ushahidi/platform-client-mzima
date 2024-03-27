import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreadcrumbService, BreakpointService, SessionService } from '@services';
import { ShareModalComponent } from '../../share-modal/share-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../../../base.component';
import { NavToolbarService } from '../../../helpers/navtoolbar.service';

@UntilDestroy()
@Component({
  selector: 'app-share-and-donate',
  templateUrl: './share-and-donate.component.html',
  styleUrls: ['./share-and-donate.component.scss'],
})
export class ShareAndDonateComponent extends BaseComponent {
  public isDonateAvailable = false;
  public pageTitle: string;

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private breadcrumbService: BreadcrumbService,
    public navToolbarService: NavToolbarService,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();
    this.isDonateAvailable = <boolean>this.sessionService.getSiteConfigurations().donation?.enabled;
    this.breadcrumbService.breadcrumbs$.pipe(untilDestroyed(this)).subscribe({
      next: (res) => (this.pageTitle = res[res.length - 1]?.instance),
    });
  }

  loadData(): void {}

  public openShare() {
    this.dialog.open(ShareModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
      data: {
        title: this.translate.instant(this.pageTitle),
        description: this.translate.instant(this.pageTitle),
        label: this.translate.instant('share.share_deployment'),
      },
    });
  }
}
