import { NgModule } from '@angular/core';
import { SelectLanguagePage } from './select-language.page';
import { SelectLanguagePageRoutingModule } from './select-langugue-routing.module';
import { SharedModule } from '@shared';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [SelectLanguagePageRoutingModule, SharedModule, TranslateModule],
  declarations: [SelectLanguagePage],
})
export class SelectLanguagePageModule {}
