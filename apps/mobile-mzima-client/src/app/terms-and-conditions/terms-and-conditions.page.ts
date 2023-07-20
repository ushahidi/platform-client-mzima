import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: 'terms-and-conditions.page.html',
  styleUrls: ['terms-and-conditions.page.scss'],
})
export class TermsAndConditionsPage {
  constructor(private location: Location) {}

  public back(): void {
    this.location.back();
  }
}
