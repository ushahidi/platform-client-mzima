import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  @Input() public type: 'warning' | 'danger' | 'success' | 'info' = 'info';
  @Input() public icon?: string;
  @Input() public id: string;
  public isHidden: boolean;

  ngOnInit(): void {
    this.checkSessionStorage();
  }

  public checkSessionStorage(): void {
    this.isHidden = window.sessionStorage.getItem(`notification-${this.id}-hidden`) === 'true';
  }

  public getNotificationIcon(): string {
    if (this.icon) {
      return this.icon;
    }
    switch (this.type) {
      case 'warning':
        return 'warning';

      case 'info':
        return 'info';

      case 'danger':
        return 'tooltip';

      case 'success':
        return 'tooltip';

      default:
        return '';
    }
  }

  public hideNotification(): void {
    window.sessionStorage.setItem(`notification-${this.id}-hidden`, 'true');
    this.isHidden = true;
  }
}
