import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CollectionResult } from '@mzima-client/sdk';

@Component({
  selector: 'app-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.scss'],
})
export class CollectionItemComponent {
  @Input() public collection: CollectionResult;
  @Input() public selectable?: boolean;
  @Input() public checked?: boolean;
  @Input() public actions?: boolean;
  @Input() public disabled: boolean;
  @Output() public checkedChange = new EventEmitter<boolean>();
  @Output() public edit = new EventEmitter<Event>();
  @Output() public delete = new EventEmitter<Event>();

  public editCollection(event: Event): void {
    event.stopPropagation();
    this.edit.emit(event);
  }

  public deleteCollection(event: Event): void {
    event.stopPropagation();
    this.delete.emit(event);
  }

  public changeChecked(event: Event): void {
    event.stopPropagation();
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}
