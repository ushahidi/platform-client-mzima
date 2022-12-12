import { Component, OnInit } from '@angular/core';
import { CONST } from '@constants';

@Component({
  selector: 'app-cookies-notification',
  templateUrl: './cookies-notification.component.html',
  styleUrls: ['./cookies-notification.component.scss'],
})
export class CookiesNotificationComponent implements OnInit {
  public showCookies = true;

  ngOnInit() {
    console.log(!localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}cookies`));
    this.showCookies = !localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}cookies`);
  }

  public accept() {
    if (sessionStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}cookies`)) {
      sessionStorage.removeItem(`${CONST.LOCAL_STORAGE_PREFIX}cookies`);
    }
    localStorage.setItem(`${CONST.LOCAL_STORAGE_PREFIX}cookies`, 'true');
    this.showCookies = !localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}cookies`);
  }

  public decline() {
    sessionStorage.setItem(`${CONST.LOCAL_STORAGE_PREFIX}cookies`, 'true');
    this.showCookies = !sessionStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}cookies`);
  }
}
