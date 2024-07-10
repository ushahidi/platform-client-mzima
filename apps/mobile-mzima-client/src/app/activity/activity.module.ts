import { NgModule } from '@angular/core';
import { ActivityPage } from './activity.page';
import { SharedModule } from '@shared';
import { ActivityPageRoutingModule } from './activity-routing.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [SharedModule, ActivityPageRoutingModule, TranslateModule],
  declarations: [ActivityPage],
})
export class ActivityPageModule {}
