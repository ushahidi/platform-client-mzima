import { Component, OnInit } from '@angular/core';
import { DonationConfigInterface } from '@models';
import { SessionService } from '@services';

@Component({
  selector: 'app-donation-modal',
  templateUrl: './donation-modal.component.html',
  styleUrls: ['./donation-modal.component.scss'],
})
export class DonationModalComponent implements OnInit {
  donationConfig: DonationConfigInterface;

  constructor(private session: SessionService) {}

  ngOnInit(): void {
    this.donationConfig = this.session.getSiteConfigurations().donation!;
    console.log('this.donationConfig', this.donationConfig);
  }
}
