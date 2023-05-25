import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterControl } from '@models';

@Component({
  selector: 'app-filter-control',
  templateUrl: './filter-control.component.html',
  styleUrls: ['./filter-control.component.scss'],
})
export class FilterControlComponent {
  @Input() public filter: FilterControl;
  @Input() public disabled = false;
  @Output() filterClick = new EventEmitter();

  public handleClick(event: Event): void {
    if (!this.disabled) {
      this.filterClick.emit(event);
    } else {
      event.stopPropagation();
      event.preventDefault();
    }
  }
}
