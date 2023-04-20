import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ActivityRoutingModule } from './activity-routing.module';
import { ActivityTimelineComponent } from './activity-timeline/activity-timeline.component';
import { ActivityComponent } from './activity.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ChartHeadComponent } from './chart-head/chart-head.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ActivityComponent,
    ActivityTimelineComponent,
    BarChartComponent,
    ChartHeadComponent,
  ],
  imports: [
    CommonModule,
    ActivityRoutingModule,
    NgxChartsModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
    SharedModule,
  ],
})
export class ActivityModule {}
