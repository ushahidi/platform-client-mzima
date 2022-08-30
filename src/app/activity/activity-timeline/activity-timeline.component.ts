import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { PostsService } from '@services';
import { LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { Color } from '@swimlane/ngx-charts/lib/utils/color-sets';
import dayjs from 'dayjs';

@Component({
  selector: 'app-activity-timeline',
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.scss', '../activity.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActivityTimelineComponent implements OnInit {
  public selectedFilter = '';
  public data: any[] = [];
  public legend = true;
  public xAxis = true;
  public yAxis = true;
  public showYAxisLabel = true;
  public showXAxisLabel = true;
  public xAxisLabel = 'Post created date';
  public yAxisLabel = 'Total post count';
  public timeline = true;
  public below = LegendPosition.Below;
  public colorScheme: Color = {
    name: 'Name',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };
  public filters = [
    { displayNane: 'Show all post', value: '' },
    { displayNane: 'Categories', value: 'tags' },
    { displayNane: 'Survey', value: 'form' },
    { displayNane: 'Status', value: 'status' },
  ];
  public cumulativeTotal = true;

  constructor(
    private postsService: PostsService, //
  ) {}

  ngOnInit() {
    this.getPostStatistics(this.selectedFilter);
  }

  public getPostStatistics(value: string) {
    const params = {
      timeline: 1,
      timeline_attribute: 'created',
    };
    this.data = [];
    let series: any[] = [];
    this.postsService.getPostStatistics({ ...params, group_by: value }).subscribe({
      next: (response) => {
        for (const el of response.totals) {
          for (const elValue of el.values) {
            series = [
              ...series,
              {
                name: dayjs(new Date(elValue.label * 1000)).format('D MMM YY'),
                value: this.cumulativeTotal ? elValue.cumulative_total : elValue.total,
              },
            ];
          }
          this.data = [...this.data, { name: el.key, series }];
        }
      },
    });
  }

  public change(e: MatSelectChange) {
    this.getPostStatistics(e.value);
  }

  public changeCumulativeTotal() {
    this.getPostStatistics(this.selectedFilter);
  }
}
