import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DonationComponent } from './donation.component';

const routes: Routes = [{ path: '', component: DonationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DonationRoutingModule {}
