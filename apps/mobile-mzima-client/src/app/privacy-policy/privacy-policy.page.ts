import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: 'privacy-policy.page.html',
  styleUrls: ['privacy-policy.page.scss'],
})
export class PrivacyPolicyPage {
  constructor(private location: Location) {}

  public back(): void {
    this.location.back();
  }
}
