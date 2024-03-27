import { Component, OnInit } from '@angular/core';
import { PostsService } from '@mzima-client/sdk';
import { LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { Color } from '@swimlane/ngx-charts/lib/utils/color-sets';
import { ManipulateType } from 'dayjs';

@Component({
  selector: 'app-activity-timeline',
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.scss'],
})
export class ActivityTimelineComponent implements OnInit {
  public selectedFilter = '';
  public data: any[] = [];
  public legend = true;
  public xAxis = true;
  public yAxis = true;
  public timeline = true;
  public below = LegendPosition.Below;
  public colorScheme: Color = {
    name: 'Name',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      'rgb(62, 84, 163)',
      'rgb(103, 164, 209)',
      'rgb(255, 194, 53)',
      'rgb(158, 132, 211)',
      'rgb(203, 85, 156)',
      'rgb(50, 109, 29)',
      'rgb(255, 154, 153)',
    ],
  };
  public cumulativeTotal = true;
  public dateRange: ManipulateType;
  public filters = [
    { displayName: 'Show all posts', value: '' },
    { displayName: 'Categories', value: 'tags' },
    { displayName: 'Survey', value: 'form' },
    { displayName: 'Status', value: 'status' },
  ];

  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.getPostStatistics(this.selectedFilter);
  }

  public getPostStatistics(value: string) {
    const params = {
      timeline: 1,
      timeline_attribute: 'created',
    };
    this.data = [];
    // let series: any[] = [];
    this.postsService.getPostStatistics({ ...params, group_by: value }).subscribe({
      next: (response) => {
        console.log('Response', response);

        // this.data = response.result.group_by_total_posts.map(post => {
        //   const time = new Date(parseInt(post.label) * 1000);
        //   if (!this.dateRange ||
        //       time.getTime() > dayjs().subtract(1, this.dateRange).toDate().getTime()) {
        //         series.push({
        //           name: time,
        //           value: post.total,
        //         })
        //       }
        //   return {name: post.source, series};
        // })

        // for (const el of response.totals) {
        //   for (const elValue of el.values) {
        //     const time = new Date(elValue.label * 1000);

        //     if (
        //       !this.dateRange ||
        //       time.getTime() > dayjs().subtract(1, this.dateRange).toDate().getTime()
        //     ) {
        //       series = [
        //         ...series,
        //         {
        //           name: time,
        //           value: this.cumulativeTotal ? elValue.cumulative_total : elValue.total,
        //         },
        //       ];
        //     }
        //   }

        //   this.data = [...this.data, { name: el.key, series }];
        // }
      },
    });
  }

  public change(value: string) {
    this.selectedFilter = value;
    this.getPostStatistics(this.selectedFilter);
  }

  public dateChange(date: ManipulateType): void {
    this.dateRange = date;
    this.getPostStatistics(this.selectedFilter);
  }

  public changeCumulativeTotal() {
    this.getPostStatistics(this.selectedFilter);
  }
}
