import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ManipulateType } from 'dayjs';

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

  public ranges = [
    { displayName: 'All time', value: '' },
    { displayName: 'Last week', value: 'w' },
    { displayName: 'Last month', value: 'm' },
    { displayName: 'Last year', value: 'y' },
  ];

  public rangeChange(event: MatSelectChange): void {
    this.dateChanged.emit(event.value);
  }

  public change(event: MatSelectChange): void {
    this.filterChanged.emit(event.value);
  }
}
