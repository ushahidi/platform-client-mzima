import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';

import { LanguagePageRoutingModule } from './language-routing.module';
import { LanguagePage } from './language.page';

@NgModule({
  imports: [LanguagePageRoutingModule, SharedModule],
  declarations: [LanguagePage],
})
export class LanguagePageModule {}
