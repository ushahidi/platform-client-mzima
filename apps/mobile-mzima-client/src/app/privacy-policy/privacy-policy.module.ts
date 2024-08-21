import { NgModule } from '@angular/core';
import { PrivacyPolicyPage } from './privacy-policy.page';
import { SharedModule } from '@shared';
import { PrivacyPolicyPageRoutingModule } from './privacy-policy-routing.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [SharedModule, PrivacyPolicyPageRoutingModule, TranslateModule],
  declarations: [PrivacyPolicyPage],
})
export class PrivacyPolicyPageModule {}
