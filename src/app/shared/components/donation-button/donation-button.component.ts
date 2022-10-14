import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DonationService, SessionService } from '@services';
import { DonationModalComponent } from 'src/app/settings';

@Component({
  selector: 'app-donation-button',
  templateUrl: './donation-button.component.html',
  styleUrls: ['./donation-button.component.scss'],
})
export class DonationButtonComponent implements OnInit {
  isDonationEnabled = false;
  donationInfo: any = {};

  constructor(
    private dialog: MatDialog,
    private session: SessionService,
    public donationService: DonationService,
  ) {}

  ngOnInit() {
    this.isDonationEnabled = !!this.session.getSiteConfigurations().donation?.enabled;
    if (this.isDonationEnabled) {
      console.log('donationService.isDonationEnabled');
      this.donationService.setupMonetization();
      this.donationService.donate$.subscribe((donationInfo) => {
        this.donationInfo = donationInfo;
        console.log('DonationButtonComponent: donationInfo ', donationInfo);
      });
    }
  }

  showDonation() {
    this.dialog.open(DonationModalComponent, {
      width: '100%',
      maxWidth: 564,
    });
  }
}
