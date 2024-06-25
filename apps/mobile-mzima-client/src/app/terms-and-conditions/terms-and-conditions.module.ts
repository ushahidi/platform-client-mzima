import { NgModule } from '@angular/core';
import { TermsAndConditionsPage } from './terms-and-conditions.page';
import { SharedModule } from '@shared';
import { TermsAndConditionsPageRoutingModule } from './terms-and-conditions-routing.module';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [SharedModule, TermsAndConditionsPageRoutingModule, TranslateModule],
  declarations: [TermsAndConditionsPage],
})
export class TermsAndConditionsPageModule {}
