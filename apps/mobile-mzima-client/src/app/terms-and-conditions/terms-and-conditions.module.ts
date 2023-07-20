import { NgModule } from '@angular/core';
import { TermsAndConditionsPage } from './terms-and-conditions.page';
import { SharedModule } from '@shared';
import { TermsAndConditionsPageRoutingModule } from './terms-and-conditions-routing.module';

@NgModule({
  imports: [SharedModule, TermsAndConditionsPageRoutingModule],
  declarations: [TermsAndConditionsPage],
})
export class TermsAndConditionsPageModule {}
