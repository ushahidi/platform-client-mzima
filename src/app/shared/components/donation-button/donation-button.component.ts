import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DonationModalComponent } from 'src/app/settings';

@Component({
  selector: 'app-donation-button',
  templateUrl: './donation-button.component.html',
  styleUrls: ['./donation-button.component.scss'],
})
export class DonationButtonComponent {
  constructor(private dialog: MatDialog) {}

  showDonation() {
    console.log('!');
    this.dialog.open(DonationModalComponent);
  }
}
