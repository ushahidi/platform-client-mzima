import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DonationRoutingModule } from './donation-routing.module';
import { DonationComponent } from './donation.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SettingsModule } from '../settings.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [DonationComponent],
  imports: [
    CommonModule,
    SharedModule,
    DonationRoutingModule,
    SettingsModule,
    MatSlideToggleModule,
  ],
})
export class DonationModule {}
