import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EventBusService, EventType, SessionService } from '@services';

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
export class SupportModalComponent {
  public menu: SupportMenuItemInterface[];
  isLoggedIn = false;

  constructor(
    private translate: TranslateService,
    private matDialogRef: MatDialogRef<SupportModalComponent>,
    private eventBusService: EventBusService,
    private session: SessionService,
  ) {
    this.initMenu();
    this.session.currentUserData$.subscribe({
      next: (userData) => {
        this.isLoggedIn = !!userData.userId;
      },
    });
  }

  private initMenu(): void {
    this.menu = [
      {
        title: this.translate.instant('app.documentation.title'),
        description: this.translate.instant('app.documentation.description'),
        action: () => {
          this.openUrl('https://docs.ushahidi.com/ushahidi-platform-user-manual');
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
        title: 'Onboarding',
        description: 'Take a look at the Ushahidi onboarding again.',
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
    ];
  }

  private closeModal(): void {
    this.matDialogRef.close();
  }

  private openUrl(url: string): void {
    window.open(url, '_blank')?.focus();
  }
}
