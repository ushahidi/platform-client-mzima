import { NgModule } from '@angular/core';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { SharedModule } from '@shared';

@NgModule({
  imports: [ProfilePageRoutingModule, SharedModule],
})
export class ProfilePageModule {}
