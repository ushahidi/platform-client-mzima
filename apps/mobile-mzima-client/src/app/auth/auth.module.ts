import { NgModule } from '@angular/core';
import { AuthPage } from './auth.page';
import { AuthPageRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [AuthPageRoutingModule, SharedModule],
  declarations: [AuthPage],
})
export class AuthPageModule {}
