import { NgModule } from '@angular/core';
import { ActivityPage } from './activity.page';
import { SharedModule } from '@shared';
import { ActivityPageRoutingModule } from './activity-routing.module';

@NgModule({
  imports: [SharedModule, ActivityPageRoutingModule],
  declarations: [ActivityPage],
})
export class ActivityPageModule {}
