import { Component } from '@angular/core';
import { navigationMenu } from '@constants';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  public menu = navigationMenu;
}
