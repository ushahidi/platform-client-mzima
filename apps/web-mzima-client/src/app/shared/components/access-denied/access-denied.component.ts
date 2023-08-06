import { Component } from '@angular/core';
import { EventBusService, EventType } from '@services';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss'],
})
export class AccessDeniedComponent {
  constructor(private eventBusService: EventBusService) {
    this.eventBusService.next({
      type: EventType.OpenLoginModal,
      payload: { hasBackdrop: true, disableClose: true },
    });
  }
}
