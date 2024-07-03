import { NgModule } from '@angular/core';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { SharedModule } from '@shared';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [ProfilePageRoutingModule, SharedModule, TranslateModule],
})
export class ProfilePageModule {}
