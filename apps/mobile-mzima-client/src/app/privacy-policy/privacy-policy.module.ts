import { NgModule } from '@angular/core';
import { PrivacyPolicyPage } from './privacy-policy.page';
import { SharedModule } from '@shared';
import { PrivacyPolicyPageRoutingModule } from './privacy-policy-routing.module';

@NgModule({
  imports: [SharedModule, PrivacyPolicyPageRoutingModule],
  declarations: [PrivacyPolicyPage],
})
export class PrivacyPolicyPageModule {}
