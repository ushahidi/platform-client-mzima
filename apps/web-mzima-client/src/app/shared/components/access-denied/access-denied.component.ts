import { Component } from '@angular/core';
import { EventBusService, EventType, SessionService } from '@services';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss'],
})
export class AccessDeniedComponent {
  public adminEmail: string;

  constructor(private eventBusService: EventBusService, private sessionService: SessionService) {
    this.getAdminContact();
    this.eventBusService.next({
      type: EventType.OpenLoginModal,
      payload: { hasBackdrop: true, disableClose: true },
    });
  }

  private getAdminContact() {
    this.adminEmail = this.sessionService.getSiteConfigurations().email!;
  }
}
