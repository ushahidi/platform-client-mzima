import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointService, EventBusService, EventType, SessionService } from '@services';
import { BaseComponent } from '../../../base.component';

interface SupportMenuItemInterface {
  title: string;
  description?: string;
  action?: () => void;
}

@Component({
  selector: 'app-support-modal',
  templateUrl: './support-modal.component.html',
  styleUrls: ['./support-modal.component.scss'],
})
export class SupportModalComponent extends BaseComponent {
  public menu: SupportMenuItemInterface[];

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private translate: TranslateService,
    private matDialogRef: MatDialogRef<SupportModalComponent>,
    private eventBusService: EventBusService,
  ) {
    super(sessionService, breakpointService);
    this.getUserData();
    this.initMenu();
  }

  loadData(): void {}

  private initMenu(): void {
    this.menu = [
      {
        title: this.translate.instant('app.documentation.title'),
        description: this.translate.instant('app.documentation.description'),
        action: () => {
          this.openUrl('https://docs.ushahidi.com/platform-user-manual');
          this.closeModal();
        },
      },
      {
        title: this.translate.instant('app.report_a_bug.title'),
        description: this.translate.instant('app.report_a_bug.description'),
        action: () => {
          this.openUrl('https://github.com/ushahidi/platform/issues/new');
          this.closeModal();
        },
      },
      {
        title: this.translate.instant('app.features.title'),
        description: this.translate.instant('app.features.description'),
        action: () => {
          this.openUrl('https://www.ushahidi.com/features/');
          this.closeModal();
        },
      },
      {
        title: this.translate.instant('app.onboarding.title'),
        description: this.translate.instant('app.onboarding.description'),
        action: () => {
          this.eventBusService.next({
            type: EventType.ShowOnboarding,
            payload: true,
          });
          this.closeModal();
        },
      },
      // {
      //   title: this.translate.instant('app.intercom.intercom'),
      //   description: this.translate.instant('app.intercom.description'),
      //   action: () => {
      //     window.open('mailto:hl5rfiga@intercom-mail.com');
      //     this.closeModal();
      //   },
      // },
      {
        title: this.translate.instant('app.terms_and_conditions'),
        description: this.translate.instant('app.terms_and_conditions'),
        action: () => {
          this.openUrl('https://www.ushahidi.com/terms-of-service/');
          this.closeModal();
        },
      },
      {
        title: this.translate.instant('app.privacy_policy'),
        description: this.translate.instant('app.privacy_policy'),
        action: () => {
          this.openUrl('https://www.ushahidi.com/privacy-policy/');
          this.closeModal();
        },
      },
    ];
  }

  private closeModal(): void {
    this.matDialogRef.close();
  }

  public openUrl(url: string): void {
    window.open(url, '_blank')?.focus();
  }
}
