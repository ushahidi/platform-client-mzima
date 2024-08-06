import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CollectionItem } from '@mzima-client/sdk';

@Component({
  selector: 'app-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.scss'],
})
export class CollectionItemComponent {
  @Input() public collection: CollectionItem;
  @Input() public editable?: boolean;
  @Output() collectionChanged = new EventEmitter<boolean>();
  @Output() editCollection = new EventEmitter();

  public editClickHandle(event: Event): void {
    event.stopPropagation();
    this.editCollection.emit();
  }
}
