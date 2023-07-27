import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-activity',
  templateUrl: 'activity.page.html',
  styleUrls: ['activity.page.scss'],
})
export class ActivityPage {
  constructor(private location: Location) {}

  public back(): void {
    this.location.back();
  }
}
