import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventBusService, EventType } from '@services';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
})
export class ResetComponent {
  public isPasswordRestored: boolean;

  constructor(private eventBusService: EventBusService, private router: Router) {}

  public passwordRestored(): void {
    this.isPasswordRestored = true;
  }

  public openLoginModal(): void {
    this.eventBusService.next({
      type: EventType.OpenLoginModal,
      payload: {},
    });
    this.router.navigate(['map']);
  }
}
