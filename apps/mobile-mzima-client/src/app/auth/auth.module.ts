import { NgModule } from '@angular/core';
import { AuthPage } from './auth.page';
import { AuthPageRoutingModule } from './auth-routing.module';
import { SharedModule } from '@shared';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [AuthPageRoutingModule, SharedModule, TranslateModule],
  declarations: [AuthPage],
})
export class AuthPageModule {}
