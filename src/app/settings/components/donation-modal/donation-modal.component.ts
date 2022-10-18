import { Component, OnInit } from '@angular/core';
import { DonationConfigInterface } from '@models';
import { DonationService, SessionService } from '@services';

@Component({
  selector: 'app-donation-modal',
  templateUrl: './donation-modal.component.html',
  styleUrls: ['./donation-modal.component.scss'],
})
export class DonationModalComponent implements OnInit {
  donationConfig: DonationConfigInterface;
  donationInfo: any = {};

  constructor(private session: SessionService, public donationService: DonationService) {}

  ngOnInit(): void {
    this.donationConfig = this.session.getSiteConfigurations().donation!;
    this.donationService.donate$.subscribe((donationInfo) => {
      console.log('donationService: donationInfo', donationInfo);
      this.donationInfo = donationInfo;
    });
  }
}
