import { Component, OnInit } from '@angular/core';
import { PostsService } from '@mzima-client/sdk';
import { ScaleType } from '@swimlane/ngx-charts';
import { Color } from '@swimlane/ngx-charts/lib/utils/color-sets';
import { ManipulateType } from 'dayjs';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss', '../activity.component.scss'],
})
export class BarChartComponent implements OnInit {
  public data: any[] = [];
  public selectedFilter = 'tags';
  public colorScheme: Color = {
    name: 'Custom color',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FFEBBB'],
  };
  public dateRange: ManipulateType;
  public filters = [
    { displayNane: 'Categories', value: 'tags' },
    { displayNane: 'Survey', value: 'form' },
    { displayNane: 'Status', value: 'status' },
  ];

  constructor(private postsService: PostsService) {}

  public ngOnInit() {
    this.getPostStatistics(this.selectedFilter);
  }

  public getPostStatistics(value: any) {
    this.data = [];
    this.postsService.getPostStatistics({ group_by: value }).subscribe({
      next: (response) => {
        for (const el of response.totals) {
          for (const elValue of el.values) {
            this.data = [...this.data, { name: elValue.label, value: elValue.total }];
          }
        }
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
}
