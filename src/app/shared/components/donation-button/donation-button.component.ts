import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Meta } from '@angular/platform-browser';
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
    private meta: Meta,
  ) {}

  ngOnInit() {
    this.isDonationEnabled = !!this.session.getSiteConfigurations().donation?.enabled;
    if (this.isDonationEnabled) {
      this.setPaymentPointer(this.session.getSiteConfigurations().donation?.wallet);
      this.donationService.setupMonetization();
      this.donationService.donate$.subscribe((donationInfo) => {
        this.donationInfo = donationInfo;
      });
    }
  }

  private setPaymentPointer(paymentPointer?: string): void {
    if (paymentPointer) {
      this.meta.updateTag({ name: 'monetization', content: paymentPointer });
    } else {
      this.meta.removeTag('name="monetization"');
    }
  }

  showDonation() {
    this.dialog.open(DonationModalComponent, {
      width: '100%',
      maxWidth: 564,
    });
  }
}
