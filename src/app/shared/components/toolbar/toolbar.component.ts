import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SessionService } from '@services';
import { filter } from 'rxjs';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  isDonateAvailable = false;
  public showSubmitPostButton = true;

  constructor(private session: SessionService, private router: Router) {
    this.isDonateAvailable = this.session.getSiteConfigurations().donation?.enabled!;

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const url = router.routerState.snapshot.url;
      this.showSubmitPostButton = (url.indexOf('/settings') && url.indexOf('/activity')) === -1;
    });
  }
}
