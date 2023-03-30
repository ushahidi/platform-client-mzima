import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule } from '@shared';

import { DonationRoutingModule } from './donation-routing.module';
import { DonationComponent } from './donation.component';
import { SettingsModule } from '../settings.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

@NgModule({
  declarations: [DonationComponent],
  imports: [
    CommonModule,
    DonationRoutingModule,
    SettingsModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    DirectiveModule,
    TranslateModule,
    MatInputModule,
    MatButtonModule,
    MzimaUiModule,
  ],
})
export class DonationModule {}
