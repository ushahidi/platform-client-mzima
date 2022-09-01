import { Component } from '@angular/core';
import { SessionService } from '@services';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  isDonateAvailable = false;

  constructor(private session: SessionService) {
    this.isDonateAvailable = this.session.getSiteConfigurations().donation?.enabled!;
  }
}
