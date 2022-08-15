import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DonationRoutingModule } from './donation-routing.module';
import { DonationComponent } from './donation.component';

@NgModule({
  declarations: [DonationComponent],
  imports: [CommonModule, DonationRoutingModule],
})
export class DonationModule {}
