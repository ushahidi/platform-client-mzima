import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { PostsService } from '@services';
import { ScaleType } from '@swimlane/ngx-charts';
import { Color } from '@swimlane/ngx-charts/lib/utils/color-sets';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss', '../activity.component.scss'],
})
export class BarChartComponent implements OnInit {
  data: any[] = [];
  selectedFilter: string = 'status';
  colorScheme: Color = {
    name: 'Custom color',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };
  filters = [
    { displayNane: 'Status', value: 'status' },
    { displayNane: 'Survey', value: 'form' },
    { displayNane: 'Categories', value: 'tags' },
  ];

  constructor(
    private postsService: PostsService, //
  ) {}

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

  public change(e: MatSelectChange) {
    this.getPostStatistics(e.value);
  }
}
