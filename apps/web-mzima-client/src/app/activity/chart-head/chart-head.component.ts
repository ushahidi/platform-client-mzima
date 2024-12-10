import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ManipulateType } from 'dayjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-chart-head',
  templateUrl: './chart-head.component.html',
  styleUrls: ['./chart-head.component.scss'],
})
export class ChartHeadComponent {
  @Input() public title?: string;
  @Input() public filters: any[];
  @Input() public selectedFilter: string;
  @Input() public selectedRange: ManipulateType;
  @Output() public filterChanged = new EventEmitter();
  @Output() public dateChanged = new EventEmitter();
  public ranges: { displayName: string; value: string | null }[] = [];

  constructor(private translate: TranslateService) {
    this.initializeRanges();
  }

  private initializeRanges() {
    this.ranges = [
      { displayName: this.translate.instant('activity.all_time'), value: null },
      { displayName: this.translate.instant('activity.last_week'), value: 'w' },
      { displayName: this.translate.instant('activity.last_month'), value: 'm' },
      { displayName: this.translate.instant('activity.last_year'), value: 'y' },
    ];
  }

  public rangeChange(event: MatSelectChange): void {
    this.dateChanged.emit(event.value);
  }

  public change(event: MatSelectChange): void {
    this.filterChanged.emit(event.value);
  }
}
