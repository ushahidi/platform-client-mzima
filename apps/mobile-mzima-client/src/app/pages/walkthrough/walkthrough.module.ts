import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

import { WalkthroughPageRoutingModule } from './walkthrough-routing.module';

import { WalkthroughPage } from './walkthrough.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WalkthroughPageRoutingModule,
    MzimaUiModule,
    TranslateModule,
  ],
  declarations: [WalkthroughPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WalkthroughPageModule {}
